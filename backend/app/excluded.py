from __future__ import annotations

from collections import Counter


def build_excluded(
    task_excluded: list[dict],
    commit_excluded: list[dict],
) -> dict:
    task_reasons = Counter(item["reason"] for item in task_excluded)
    commit_reasons = Counter(item["reason"] for item in commit_excluded)

    summary = {
        "outside_period": task_reasons.get("outside_period", 0),
        "rejected": task_reasons.get("rejected", 0),
        "duplicate": task_reasons.get("duplicate", 0),
        "not_payable_status": task_reasons.get("not_payable_status", 0),
        "unknown_assignee": task_reasons.get("unknown_assignee", 0),
        "no_median": task_reasons.get("no_median", 0),
        "commit_outside_period": commit_reasons.get("outside_period", 0),
        "unknown_commit_author": commit_reasons.get("unknown_author", 0),
    }

    return {
        "summary": summary,
        "tasks": task_excluded,
        "commits": commit_excluded,
    }
