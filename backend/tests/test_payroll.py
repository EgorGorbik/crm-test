from __future__ import annotations

from pathlib import Path

import pytest

from backend.app.median import median, resolve_estimate
from backend.app.payroll import calculate_payroll

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"

DEVS = [
    {"name": "Ada Lovelace", "gitLogin": "ada", "fixed": 1000},
    {"name": "Alan Turing", "gitLogin": "alan", "fixed": 1500},
]


def test_basic_payroll_calculation():
    tasks = [
        {
            "key": "T-1",
            "project": "P",
            "type": "Bug",
            "status": "Done",
            "estimate": 4,
            "assignee": "Ada Lovelace",
            "inProgressAt": "2026-07-01T09:00:00Z",
            "resolvedAt": "2026-07-10T12:00:00Z",
        },
        {
            "key": "T-2",
            "project": "P",
            "type": "Story",
            "status": "Closed",
            "estimate": 6,
            "assignee": "Alan Turing",
            "inProgressAt": "2026-07-02T09:00:00Z",
            "resolvedAt": "2026-07-15T12:00:00Z",
        },
    ]
    commits = [
        {
            "sha": "aaa",
            "author": "ada",
            "repo": "r",
            "branch": "main",
            "date": "2026-07-05T10:00:00Z",
            "message": "m1",
        },
        {
            "sha": "bbb",
            "author": "ada",
            "repo": "r",
            "branch": "main",
            "date": "2026-07-05T12:00:00Z",
            "message": "m2",
        },
        {
            "sha": "ccc",
            "author": "ada",
            "repo": "r",
            "branch": "main",
            "date": "2026-07-08T10:00:00Z",
            "message": "m3",
        },
        {
            "sha": "ddd",
            "author": "alan",
            "repo": "r",
            "branch": "main",
            "date": "2026-07-09T10:00:00Z",
            "message": "m4",
        },
    ]

    result = calculate_payroll(
        "2026-07",
        developers=DEVS,
        tasks=tasks,
        commits=commits,
    )

    by_name = {d["name"]: d for d in result["developers"]}
    assert by_name["Ada Lovelace"]["tasks"] == 1
    assert by_name["Ada Lovelace"]["points"] == 4
    assert by_name["Ada Lovelace"]["piece"] == 100
    assert by_name["Ada Lovelace"]["fixed"] == 1000
    assert by_name["Ada Lovelace"]["total"] == 1100
    assert by_name["Ada Lovelace"]["commits"] == 3
    assert by_name["Ada Lovelace"]["activeDays"] == 2

    assert by_name["Alan Turing"]["points"] == 6
    assert by_name["Alan Turing"]["piece"] == 150
    assert by_name["Alan Turing"]["total"] == 1650
    assert by_name["Alan Turing"]["commits"] == 1
    assert by_name["Alan Turing"]["activeDays"] == 1

    assert result["totals"]["tasks"] == 2
    assert result["totals"]["points"] == 10
    assert result["totals"]["piece"] == 250
    assert result["totals"]["fixed"] == 2500
    assert result["totals"]["total"] == 2750


def test_missing_estimate_uses_type_median():
    tasks = [
        {
            "key": "B-1",
            "project": "P",
            "type": "Bug",
            "status": "Done",
            "estimate": 1,
            "assignee": "Ada Lovelace",
            "inProgressAt": "2026-06-01T09:00:00Z",
            "resolvedAt": "2026-06-10T12:00:00Z",
        },
        {
            "key": "B-2",
            "project": "P",
            "type": "Bug",
            "status": "Closed",
            "estimate": 5,
            "assignee": "Alan Turing",
            "inProgressAt": "2026-08-01T09:00:00Z",
            "resolvedAt": "2026-08-10T12:00:00Z",
        },
        {
            "key": "B-3",
            "project": "P",
            "type": "Bug",
            "status": "Done",
            "estimate": 9,
            "assignee": "Ada Lovelace",
            "inProgressAt": "2026-05-01T09:00:00Z",
            "resolvedAt": "2026-05-10T12:00:00Z",
        },
        {
            "key": "B-4",
            "project": "P",
            "type": "Bug",
            "status": "Done",
            "estimate": None,
            "assignee": "Ada Lovelace",
            "inProgressAt": "2026-07-01T09:00:00Z",
            "resolvedAt": "2026-07-12T12:00:00Z",
        },
        {
            "key": "S-1",
            "project": "P",
            "type": "Spike",
            "status": "Done",
            "estimate": None,
            "assignee": "Alan Turing",
            "inProgressAt": "2026-07-01T09:00:00Z",
            "resolvedAt": "2026-07-12T12:00:00Z",
        },
    ]

    # median([1,5,9]) == 5
    assert median([1, 5, 9]) == 5

    result = calculate_payroll(
        "2026-07",
        developers=DEVS,
        tasks=tasks,
        commits=[],
    )

    by_name = {d["name"]: d for d in result["developers"]}
    assert by_name["Ada Lovelace"]["tasks"] == 1
    assert by_name["Ada Lovelace"]["points"] == 5
    assert by_name["Ada Lovelace"]["piece"] == 125

    assert by_name["Alan Turing"]["tasks"] == 0
    reasons = {e["key"]: e["reason"] for e in result["excluded"]["tasks"]}
    assert reasons["S-1"] == "no_median"
    assert result["excluded"]["summary"]["no_median"] == 1


def test_status_and_date_filtering():
    tasks = [
        {
            "key": "OK",
            "project": "P",
            "type": "Task",
            "status": "Done",
            "estimate": 2,
            "assignee": "Ada Lovelace",
            "inProgressAt": "2026-07-01T09:00:00Z",
            "resolvedAt": "2026-07-20T12:00:00Z",
        },
        {
            "key": "AUG",
            "project": "P",
            "type": "Task",
            "status": "Done",
            "estimate": 2,
            "assignee": "Ada Lovelace",
            "inProgressAt": "2026-07-25T09:00:00Z",
            "resolvedAt": "2026-08-02T12:00:00Z",
        },
        {
            "key": "JUN",
            "project": "P",
            "type": "Task",
            "status": "Closed",
            "estimate": 2,
            "assignee": "Ada Lovelace",
            "inProgressAt": "2026-06-01T09:00:00Z",
            "resolvedAt": "2026-06-28T12:00:00Z",
        },
        {
            "key": "REJ",
            "project": "P",
            "type": "Task",
            "status": "Rejected",
            "estimate": 2,
            "assignee": "Ada Lovelace",
            "inProgressAt": "2026-07-01T09:00:00Z",
            "resolvedAt": "2026-07-05T12:00:00Z",
        },
        {
            "key": "DUP",
            "project": "P",
            "type": "Task",
            "status": "Duplicate",
            "estimate": 2,
            "assignee": "Ada Lovelace",
            "inProgressAt": "2026-07-01T09:00:00Z",
            "resolvedAt": "2026-07-05T12:00:00Z",
        },
        {
            "key": "WIP",
            "project": "P",
            "type": "Task",
            "status": "In Progress",
            "estimate": 2,
            "assignee": "Ada Lovelace",
            "inProgressAt": "2026-07-01T09:00:00Z",
            "resolvedAt": None,
        },
    ]

    result = calculate_payroll(
        "2026-07",
        developers=DEVS,
        tasks=tasks,
        commits=[],
    )

    by_name = {d["name"]: d for d in result["developers"]}
    assert by_name["Ada Lovelace"]["tasks"] == 1
    assert by_name["Ada Lovelace"]["points"] == 2

    reasons = {e["key"]: e["reason"] for e in result["excluded"]["tasks"]}
    assert reasons["AUG"] == "outside_period"
    assert reasons["JUN"] == "outside_period"
    assert reasons["REJ"] == "rejected"
    assert reasons["DUP"] == "duplicate"
    assert reasons["WIP"] == "not_payable_status"
    assert result["excluded"]["summary"]["outside_period"] == 2
    assert result["excluded"]["summary"]["rejected"] == 1
    assert result["excluded"]["summary"]["duplicate"] == 1
    assert result["excluded"]["summary"]["not_payable_status"] == 1


def test_dirty_data_unknown_assignee_and_author():
    tasks = [
        {
            "key": "UNK",
            "project": "P",
            "type": "Bug",
            "status": "Done",
            "estimate": 3,
            "assignee": "Ghost Developer",
            "inProgressAt": "2026-07-01T09:00:00Z",
            "resolvedAt": "2026-07-10T12:00:00Z",
        },
        {
            "key": "OK",
            "project": "P",
            "type": "Bug",
            "status": "Done",
            "estimate": 3,
            "assignee": "Ada Lovelace",
            "inProgressAt": "2026-07-01T09:00:00Z",
            "resolvedAt": "2026-07-11T12:00:00Z",
        },
    ]
    commits = [
        {
            "sha": "ext1",
            "author": "unknown.bot",
            "repo": "r",
            "branch": "main",
            "date": "2026-07-12T10:00:00Z",
            "message": "external",
        },
        {
            "sha": "ada1",
            "author": "ada",
            "repo": "r",
            "branch": "main",
            "date": "2026-07-12T11:00:00Z",
            "message": "ok",
        },
    ]

    result = calculate_payroll(
        "2026-07",
        developers=DEVS,
        tasks=tasks,
        commits=commits,
    )

    by_name = {d["name"]: d for d in result["developers"]}
    assert by_name["Ada Lovelace"]["tasks"] == 1
    assert by_name["Ada Lovelace"]["commits"] == 1

    task_reasons = {e["key"]: e["reason"] for e in result["excluded"]["tasks"]}
    assert task_reasons["UNK"] == "unknown_assignee"
    assert result["excluded"]["summary"]["unknown_assignee"] == 1

    commit_reasons = {
        e["sha"]: e["reason"] for e in result["excluded"]["commits"]
    }
    assert commit_reasons["ext1"] == "unknown_author"
    assert result["excluded"]["summary"]["unknown_commit_author"] == 1


def test_fixture_data_smoke():
    """Sanity check against synthetic fixtures (not a hardcoded payroll oracle)."""
    result = calculate_payroll("2026-07", data_dir=DATA)
    assert len(result["developers"]) == 7
    assert result["totals"]["tasks"] > 0
    assert result["excluded"]["summary"]["no_median"] >= 1
    assert result["excluded"]["summary"]["unknown_assignee"] >= 1
    assert result["excluded"]["summary"]["unknown_commit_author"] >= 1

    anna = next(d for d in result["developers"] if d["name"] == "Anna Kowalski")
    assert anna["commits"] == 8
    assert anna["activeDays"] == 3

    assert len(result["tasks"]) == 30
    assert len(result["commits"]) == 32
    included = [t for t in result["tasks"] if t["payrollStatus"] == "Included"]
    excluded = [t for t in result["tasks"] if t["payrollStatus"] == "Excluded"]
    assert len(included) == result["totals"]["tasks"]
    assert len(excluded) == len(result["excluded"]["tasks"])
    assert all(t["project"] for t in result["tasks"])
    assert all(c["repo"] for c in result["commits"])
