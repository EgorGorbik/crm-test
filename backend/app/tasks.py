from __future__ import annotations

from .median import estimates_by_type, resolve_estimate
from .period import in_period, parse_iso_date


PAYABLE_STATUSES = {"Done", "Closed"}
EXCLUDED_STATUSES = {
    "Rejected": "rejected",
    "Duplicate": "duplicate",
}


def process_tasks(
    tasks: list[dict],
    by_name: dict[str, dict],
    start,
    end,
) -> tuple[dict[str, list[dict]], list[dict]]:
    """
    Classify tasks into payable-per-developer and excluded entries.

    Returns:
      paid_by_dev: name -> list of {key, points}
      excluded: list of {key, reason}
    """
    by_type = estimates_by_type(tasks)
    paid_by_dev: dict[str, list[dict]] = {name: [] for name in by_name}
    excluded: list[dict] = []

    for task in tasks:
        key = task["key"]
        status = task["status"]

        if status in EXCLUDED_STATUSES:
            excluded.append({"key": key, "reason": EXCLUDED_STATUSES[status]})
            continue

        if status not in PAYABLE_STATUSES:
            excluded.append({"key": key, "reason": "invalid_status"})
            continue

        resolved = parse_iso_date(task.get("resolvedAt"))
        if not in_period(resolved, start, end):
            excluded.append({"key": key, "reason": "outside_period"})
            continue

        assignee = task.get("assignee")
        if assignee not in by_name:
            excluded.append({"key": key, "reason": "unknown_assignee"})
            continue

        points, reason = resolve_estimate(task, by_type)
        if points is None:
            excluded.append({"key": key, "reason": reason or "no_median"})
            continue

        paid_by_dev[assignee].append({"key": key, "points": points})

    return paid_by_dev, excluded
