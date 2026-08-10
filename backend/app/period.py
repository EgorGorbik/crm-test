from __future__ import annotations

from datetime import date, datetime
from calendar import monthrange


def parse_iso_date(value: str | None) -> date | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00")).date()


def parse_month(month: str) -> tuple[date, date]:
    """Parse YYYY-MM into inclusive [start, end] calendar month dates."""
    try:
        year_s, month_s = month.split("-")
        year, mon = int(year_s), int(month_s)
    except ValueError as exc:
        raise ValueError(f"Invalid month format: {month}") from exc
    if mon < 1 or mon > 12:
        raise ValueError(f"Invalid month: {month}")
    start = date(year, mon, 1)
    end = date(year, mon, monthrange(year, mon)[1])
    return start, end


def in_period(d: date | None, start: date, end: date) -> bool:
    return d is not None and start <= d <= end
