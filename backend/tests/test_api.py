from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_payroll_endpoint():
    response = client.get("/api/payroll", params={"month": "2026-07"})
    assert response.status_code == 200
    body = response.json()
    assert "totals" in body
    assert "developers" in body
    assert "excluded" in body
    assert len(body["developers"]) == 7
    assert body["excluded"]["summary"]["unknown_assignee"] >= 1


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
