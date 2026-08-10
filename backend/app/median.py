from __future__ import annotations


def median(values: list[float | int]) -> float | None:
    """Return median of numeric values, or None if empty."""
    if not values:
        return None
    ordered = sorted(values)
    n = len(ordered)
    mid = n // 2
    if n % 2 == 1:
        return float(ordered[mid])
    return (ordered[mid - 1] + ordered[mid]) / 2.0


def estimates_by_type(tasks: list[dict]) -> dict[str, list[float]]:
    """Collect estimates for every task that has one, grouped by type."""
    result: dict[str, list[float]] = {}
    for task in tasks:
        estimate = task.get("estimate")
        if estimate is not None:
            result.setdefault(task["type"], []).append(float(estimate))
    return result


def resolve_estimate(
    task: dict,
    by_type: dict[str, list[float]],
) -> tuple[float | None, str | None]:
    """
    Return (estimate, None) or (None, reason) when estimate cannot be resolved.
    Median uses all estimated tasks of the same type in the full dataset.
    """
    estimate = task.get("estimate")
    if estimate is not None:
        return float(estimate), None

    med = median(by_type.get(task["type"], []))
    if med is None:
        return None, "no_median"
    return med, None
