from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "neurotrial-api"


def test_analysis_requires_server_side_api_key(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    response = client.post("/api/v1/analyze", json={"prompt": "Summarize this trial"})
    assert response.status_code == 503
    assert "not configured" in response.json()["detail"]


def test_analysis_rejects_empty_prompt():
    response = client.post("/api/v1/analyze", json={"prompt": " "})
    assert response.status_code == 422


def test_analysis_rejects_oversized_prompt():
    response = client.post("/api/v1/analyze", json={"prompt": "x" * 30001})
    assert response.status_code == 422
