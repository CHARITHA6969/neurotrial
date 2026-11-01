# Neurotrial API walkthrough

Base URL: `http://localhost:8000`

These examples work with the Docker Compose stack or a locally running FastAPI service.

## 1. Check API health

```bash
curl -sS http://localhost:8000/health
```

## 2. Upload a source document

Create a local text file named `trial-summary.txt` with synthetic or public, non-confidential example text. Then upload it:

```bash
curl -sS http://localhost:8000/api/v1/documents \
  -F "file=@trial-summary.txt"
```

The response includes the document ID, filename, chunk count, and SHA-256 fingerprint. Supported uploads are PDF, UTF-8 TXT, and Markdown, up to 8 MB.

## 3. List source documents

```bash
curl -sS http://localhost:8000/api/v1/documents
```

## 4. Ask a question over retrieved sources

```bash
curl -sS http://localhost:8000/api/v1/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What primary endpoint is described in the source?"
  }'
```

The backend ranks relevant chunks using the BM25-style lexical baseline, passes excerpts to the configured Anthropic model, and returns the answer plus source/chunk citations. Unknown `[S#]` labels are rejected. Citation-label validation does not prove that a passage entails a claim; the response must still be checked against the source.

## 5. Test without a provider key

Document upload and retrieval can be tested without an Anthropic key by mocking the provider in the automated tests:

```bash
cd backend
python -m pip install -r requirements.txt
PYTHONPATH=. pytest
```

The API tests use a fresh in-memory SQLite database per test. The model-backed endpoints return HTTP 503 when the server-side `ANTHROPIC_API_KEY` is not configured.

## 6. Enable model-backed analysis locally

Set `ANTHROPIC_API_KEY` in the backend process environment or in the root `.env` file used by Docker Compose. Never send it to the React application, expose it in browser storage, or commit it.

GitHub Actions runs frontend tests/builds, backend tests, and builds both container images.
