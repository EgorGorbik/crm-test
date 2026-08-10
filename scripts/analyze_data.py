#!/usr/bin/env python3
"""Analyze synthetic payroll fixtures for structure and edge cases."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

PERIOD_START = date(2026, 7, 1)
PERIOD_END = date(2026, 7, 31)


def load(name: str):
    with open(DATA / name, encoding="utf-8") as f:
        return json.load(f)


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00")).date()


def in_july(d: date | None) -> bool:
    return d is not None and PERIOD_START <= d <= PERIOD_END


def main() -> None:
    devs = load("devs.json")
    tasks = load("tasks.json")
    commits = load("commits.json")

    dev_names = {d["name"] for d in devs}
    git_logins = {d["gitLogin"] for d in devs}

    statuses = Counter(t["status"] for t in tasks)
    types = Counter(t["type"] for t in tasks)

    missing_estimates = [t["key"] for t in tasks if t.get("estimate") is None]
    unknown_assignees = [
        t["key"] for t in tasks if t["assignee"] not in dev_names
    ]
    unknown_authors = [
        c["sha"][:8] for c in commits if c["author"] not in git_logins
    ]

    tasks_outside_july = [
        t["key"]
        for t in tasks
        if t["status"] in ("Done", "Closed")
        and not in_july(parse_date(t.get("resolvedAt")))
    ]
    commits_outside_july = [
        c["sha"][:8]
        for c in commits
        if not in_july(parse_date(c["date"]))
    ]

    rejected = [t["key"] for t in tasks if t["status"] == "Rejected"]
    duplicate = [t["key"] for t in tasks if t["status"] == "Duplicate"]
    in_progress = [t["key"] for t in tasks if t["status"] == "In Progress"]

    estimates_by_type: dict[str, list] = {}
    for t in tasks:
        if t.get("estimate") is not None:
            estimates_by_type.setdefault(t["type"], []).append(t["estimate"])

    types_without_estimates = [
        t for t in types if t not in estimates_by_type
    ]

    print("=== Payroll fixture analysis ===")
    print(f"developers: {len(devs)}")
    print(f"tasks:      {len(tasks)}")
    print(f"commits:    {len(commits)}")
    print()
    print("task statuses:")
    for status, count in sorted(statuses.items()):
        print(f"  {status}: {count}")
    print()
    print("task types:")
    for task_type, count in sorted(types.items()):
        estimates = estimates_by_type.get(task_type, [])
        print(
            f"  {task_type}: {count} "
            f"(with estimate: {len(estimates)}, values={sorted(estimates)})"
        )
    print()
    print(f"missing estimates ({len(missing_estimates)}): {missing_estimates}")
    print(f"unknown assignees ({len(unknown_assignees)}): {unknown_assignees}")
    print(f"unknown commit authors ({len(unknown_authors)}): {unknown_authors}")
    print(
        f"Done/Closed outside July ({len(tasks_outside_july)}): "
        f"{tasks_outside_july}"
    )
    print(
        f"commits outside July ({len(commits_outside_july)}): "
        f"{commits_outside_july}"
    )
    print(f"rejected: {rejected}")
    print(f"duplicate: {duplicate}")
    print(f"in progress: {in_progress}")
    print(f"types with no estimates anywhere: {types_without_estimates}")


if __name__ == "__main__":
    main()
