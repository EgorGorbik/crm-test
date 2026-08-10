from __future__ import annotations

from .median import estimates_by_type, resolve_estimate
from .period import in_period, parse_iso_date


PAYABLE_STATUSES = {"Done", "Closed"}
EXCLUDED_STATUSES = {
    "Rejected": "rejected",
    "Duplicate": "duplicate",
}


def _task_record(
    task: dict,
    *,
    included: bool,
    reason: str | None = None,
    points: float | None = None,
) -> dict:
    return {
        "key": task["key"],
        "project": task.get("project"),
        "type": task.get("type"),
        "status": task.get("status"),
        "estimate": task.get("estimate"),
        "points": points,
        "assignee": task.get("assignee"),
        "inProgressAt": task.get("inProgressAt"),
        "resolvedAt": task.get("resolvedAt"),
        "payrollStatus": "Included" if included else "Excluded",
        "reason": reason,
    }


def process_tasks(
    tasks: list[dict],
    by_name: dict[str, dict],
    start,
    end,
) -> tuple[dict[str, list[dict]], list[dict], list[dict]]:
    """
    Classify tasks into payable-per-developer, excluded entries, and full catalog.

    Returns:
      paid_by_dev: name -> list of {key, points}
      excluded: list of {key, reason}
      catalog: full task rows with payrollStatus
    """
    by_type = estimates_by_type(tasks)
    paid_by_dev: dict[str, list[dict]] = {name: [] for name in by_name}
    excluded: list[dict] = []
    catalog: list[dict] = []

    for task in tasks:
        key = task["key"]
        status = task["status"]

        if status in EXCLUDED_STATUSES:
            reason = EXCLUDED_STATUSES[status]
            excluded.append({"key": key, "reason": reason})
            catalog.append(_task_record(task, included=False, reason=reason))
            continue

        if status not in PAYABLE_STATUSES:
            reason = "invalid_status"
            excluded.append({"key": key, "reason": reason})
            catalog.append(_task_record(task, included=False, reason=reason))
            continue

        resolved = parse_iso_date(task.get("resolvedAt"))
        if not in_period(resolved, start, end):
            reason = "outside_period"
            excluded.append({"key": key, "reason": reason})
            catalog.append(_task_record(task, included=False, reason=reason))
            continue

        assignee = task.get("assignee")
        if assignee not in by_name:
            reason = "unknown_assignee"
            excluded.append({"key": key, "reason": reason})
            catalog.append(_task_record(task, included=False, reason=reason))
            continue

        points, reason = resolve_estimate(task, by_type)
        if points is None:
            fail_reason = reason or "no_median"
            excluded.append({"key": key, "reason": fail_reason})
            catalog.append(
                _task_record(task, included=False, reason=fail_reason)
            )
            continue

        paid_by_dev[assignee].append({"key": key, "points": points})
        catalog.append(_task_record(task, included=True, points=points))

    return paid_by_dev, excluded, catalog
