from __future__ import annotations

from pathlib import Path
from typing import Any

from .commits import process_commits
from .excluded import build_excluded
from .loading import load_payroll_data
from .mapping import build_dev_maps
from .period import parse_month
from .tasks import process_tasks

PIECE_RATE = 25


def calculate_payroll(
    month: str,
    *,
    data_dir: Path | None = None,
    developers: list[dict] | None = None,
    tasks: list[dict] | None = None,
    commits: list[dict] | None = None,
) -> dict[str, Any]:
    """
    Pure payroll calculation for a calendar month (YYYY-MM).

    Data may be injected for tests, or loaded from data_dir.
    """
    if developers is None or tasks is None or commits is None:
        if data_dir is None:
            raise ValueError("Provide data_dir or in-memory datasets")
        developers, tasks, commits = load_payroll_data(data_dir)

    start, end = parse_month(month)
    by_name, by_git = build_dev_maps(developers)

    paid_by_dev, task_excluded, task_catalog = process_tasks(
        tasks, by_name, start, end
    )
    commit_stats, commit_excluded, commit_catalog = process_commits(
        commits, by_git, start, end
    )

    developer_rows: list[dict] = []
    total_tasks = 0
    total_points = 0.0
    total_piece = 0.0
    total_fixed = 0.0

    for dev in developers:
        name = dev["name"]
        paid = paid_by_dev.get(name, [])
        points = sum(item["points"] for item in paid)
        piece = points * PIECE_RATE
        fixed = float(dev["fixed"])
        task_count = len(paid)
        stats = commit_stats.get(name, {"commits": 0, "activeDays": 0})

        row = {
            "name": name,
            "tasks": task_count,
            "points": points,
            "piece": piece,
            "fixed": fixed,
            "total": fixed + piece,
            "activeDays": stats["activeDays"],
            "commits": stats["commits"],
        }
        developer_rows.append(row)

        total_tasks += task_count
        total_points += points
        total_piece += piece
        total_fixed += fixed

    return {
        "month": month,
        "period": {
            "start": start.isoformat(),
            "end": end.isoformat(),
        },
        "totals": {
            "tasks": total_tasks,
            "points": total_points,
            "piece": total_piece,
            "fixed": total_fixed,
            "total": total_fixed + total_piece,
        },
        "developers": developer_rows,
        "tasks": task_catalog,
        "commits": commit_catalog,
        "excluded": build_excluded(task_excluded, commit_excluded),
    }
