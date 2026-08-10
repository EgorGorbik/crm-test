from __future__ import annotations

from collections import defaultdict

from .period import in_period, parse_iso_date


def process_commits(
    commits: list[dict],
    by_git: dict[str, dict],
    start,
    end,
) -> tuple[dict[str, dict], list[dict]]:
    """
    Count July commits and active days per developer (by gitLogin).

    Returns:
      stats_by_name: name -> {commits, activeDays}
      excluded: list of {sha, author, reason}
    """
    days_by_name: dict[str, set] = defaultdict(set)
    counts_by_name: dict[str, int] = defaultdict(int)
    excluded: list[dict] = []

    for commit in commits:
        sha = commit["sha"]
        author = commit["author"]
        day = parse_iso_date(commit.get("date"))

        if not in_period(day, start, end):
            excluded.append(
                {"sha": sha, "author": author, "reason": "outside_period"}
            )
            continue

        if author not in by_git:
            excluded.append(
                {"sha": sha, "author": author, "reason": "unknown_author"}
            )
            continue

        name = by_git[author]["name"]
        counts_by_name[name] += 1
        days_by_name[name].add(day)

    stats_by_name = {
        name: {
            "commits": counts_by_name.get(name, 0),
            "activeDays": len(days_by_name.get(name, set())),
        }
        for name in {d["name"] for d in by_git.values()}
    }
    return stats_by_name, excluded
