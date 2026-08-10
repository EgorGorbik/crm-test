from __future__ import annotations

from collections import defaultdict

from .period import in_period, parse_iso_date


def _commit_record(
    commit: dict,
    *,
    included: bool,
    reason: str | None = None,
) -> dict:
    return {
        "sha": commit["sha"],
        "author": commit["author"],
        "repo": commit.get("repo"),
        "branch": commit.get("branch"),
        "date": commit.get("date"),
        "message": commit.get("message"),
        "payrollStatus": "Included" if included else "Excluded",
        "reason": reason,
    }


def process_commits(
    commits: list[dict],
    by_git: dict[str, dict],
    start,
    end,
) -> tuple[dict[str, dict], list[dict], list[dict]]:
    """
    Count in-period commits / active days and build full commit catalog.

    Returns:
      stats_by_name: name -> {commits, activeDays}
      excluded: list of {sha, author, reason}
      catalog: full commit rows with payrollStatus
    """
    days_by_name: dict[str, set] = defaultdict(set)
    counts_by_name: dict[str, int] = defaultdict(int)
    excluded: list[dict] = []
    catalog: list[dict] = []

    for commit in commits:
        sha = commit["sha"]
        author = commit["author"]
        day = parse_iso_date(commit.get("date"))

        if not in_period(day, start, end):
            reason = "outside_period"
            excluded.append({"sha": sha, "author": author, "reason": reason})
            catalog.append(_commit_record(commit, included=False, reason=reason))
            continue

        if author not in by_git:
            reason = "unknown_author"
            excluded.append({"sha": sha, "author": author, "reason": reason})
            catalog.append(_commit_record(commit, included=False, reason=reason))
            continue

        name = by_git[author]["name"]
        counts_by_name[name] += 1
        days_by_name[name].add(day)
        catalog.append(_commit_record(commit, included=True))

    stats_by_name = {
        name: {
            "commits": counts_by_name.get(name, 0),
            "activeDays": len(days_by_name.get(name, set())),
        }
        for name in {d["name"] for d in by_git.values()}
    }
    return stats_by_name, excluded, catalog
