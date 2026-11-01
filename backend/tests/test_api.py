from fastapi.testclient import TestClient

from app.documents import SessionLocal
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


def test_upload_and_list_text_document():
    response = client.post(
        "/api/v1/documents",
        files={"file": ("trial-test.txt", b"Randomized controlled trial evaluated a cognitive endpoint in 120 participants.", "text/plain")},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["chunk_count"] == 1
    listing = client.get("/api/v1/documents")
    assert any(item["id"] == payload["id"] for item in listing.json())


def test_document_upload_rejects_unsupported_extension():
    response = client.post("/api/v1/documents", files={"file": ("study.exe", b"not allowed", "application/octet-stream")})
    assert response.status_code == 415


def test_retrieval_requires_matching_source():
    response = client.post("/api/v1/ask", json={"question": "unrelated vocabulary not present"})
    assert response.status_code == 404
