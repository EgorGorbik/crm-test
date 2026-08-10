from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_payroll_endpoint():
    response = client.get("/api/payroll", params={"month": "2026-07"})
    assert response.status_code == 200
    body = response.json()
    assert body["month"] == "2026-07"
    assert body["period"]["start"] == "2026-07-01"
    assert body["period"]["end"] == "2026-07-31"
    assert "totals" in body
    assert "developers" in body
    assert "excluded" in body
    assert "tasks" in body
    assert "commits" in body
    assert len(body["developers"]) == 7
    assert len(body["tasks"]) >= 1
    assert len(body["commits"]) >= 1
    assert body["excluded"]["summary"]["unknown_assignee"] >= 1

    sample_task = body["tasks"][0]
    assert {"key", "project", "type", "status", "payrollStatus"} <= set(
        sample_task
    )
    sample_commit = body["commits"][0]
    assert {"sha", "author", "repo", "branch", "payrollStatus"} <= set(
        sample_commit
    )

    included_tasks = [
        t for t in body["tasks"] if t["payrollStatus"] == "Included"
    ]
    assert len(included_tasks) == body["totals"]["tasks"]


def test_payroll_other_month():
    response = client.get("/api/payroll", params={"month": "2026-06"})
    assert response.status_code == 200
    body = response.json()
    assert body["month"] == "2026-06"
    assert body["period"]["start"] == "2026-06-01"
    assert body["period"]["end"] == "2026-06-30"
    # June has some payable fixture tasks, but not the July set.
    assert body["totals"]["tasks"] >= 1
    assert body["totals"]["tasks"] < 20


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
