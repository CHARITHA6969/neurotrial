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



def test_ask_returns_source_citations(monkeypatch):
    from app import main

    monkeypatch.setattr(main, "_provider_text", lambda prompt: "The report describes a cognitive endpoint [S1].")
    upload = client.post(
        "/api/v1/documents",
        files={"file": ("cognitive-endpoint-source.txt", b"The randomized trial measured a cognitive endpoint at week 24.", "text/plain")},
    )
    assert upload.status_code == 200
    response = client.post("/api/v1/ask", json={"question": "What cognitive endpoint was measured?"})
    assert response.status_code == 200
    result = response.json()
    assert "[S1]" in result["answer"]
    assert result["citations"][0]["filename"] == "cognitive-endpoint-source.txt"
    assert "cognitive endpoint" in result["citations"][0]["excerpt"]


def test_chunking_normalizes_whitespace():
    from app.documents import split_into_chunks

    chunks = split_into_chunks("Trial\n\nresults   showed improvement.")
    assert len(chunks) == 1
    assert chunks[0] == "Trial results showed improvement."



def test_ask_rejects_citations_that_do_not_map_to_retrieved_sources(monkeypatch):
    from app import main

    monkeypatch.setattr(main, "_provider_text", lambda prompt: "Unsupported claim [s99].")
    upload = client.post(
        "/api/v1/documents",
        files={
            "file": (
                "citation-validation-source.txt",
                b"The placebo arm recorded a biomarker endpoint at week 18.",
                "text/plain",
            )
        },
    )
    assert upload.status_code == 200

    response = client.post(
        "/api/v1/ask",
        json={"question": "Which biomarker endpoint was recorded?"},
    )
    assert response.status_code == 502
    assert "citation" in response.json()["detail"].lower()
