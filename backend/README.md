# Neurotrial API

FastAPI gateway for server-side Anthropic requests and the local document-ingestion and retrieval pipeline.

## Recommended: run the complete application

From the repository root:

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- API health: http://localhost:8000/health
- Interactive API docs: http://localhost:8000/docs

The stack works without an Anthropic key for inspecting synthetic trial scenarios, uploading sources, and checking retrieval. Add ANTHROPIC_API_KEY to the environment before running Compose to enable model-backed analysis. The key is read by the backend only.

## Run the backend without Docker

Python 3.12 is recommended.

```bash
cd backend
python -m venv .venv
# Activate the environment, then:
python -m pip install -r requirements.txt
```

macOS/Linux:

```bash
export ANTHROPIC_API_KEY="your-server-side-key"
export ANTHROPIC_MODEL="claude-sonnet-5-5"
uvicorn app.main:app --reload
```

PowerShell:

```powershell
$env:ANTHROPIC_API_KEY="your-server-side-key"
$env:ANTHROPIC_MODEL="claude-sonnet-5-5"
uvicorn app.main:app --reload
```

- Health: GET /health
- OpenAPI docs: http://localhost:8000/docs
- Analyze: POST /api/v1/analyze
- Upload a PDF/TXT/MD source: POST /api/v1/documents (multipart field: file)
- List sources: GET /api/v1/documents
- Ask over sources: POST /api/v1/ask with {"question":"What was the primary endpoint?"}

## Retrieval behavior

Uploads are limited to 8 MB and accepted only as PDF, UTF-8 text, or Markdown. PDF text is extracted with pypdf. Text is normalized and split into overlapping chunks; metadata and chunks are persisted with SQLAlchemy.

The retriever uses a deterministic BM25-style lexical score with stop-word filtering, inverse-document-frequency weighting, and passage-length normalization. It is a transparent baseline, not semantic embedding search. Responses include source/chunk identifiers and excerpts; generated [S#] labels are checked against retrieved passages, but citation entailment still requires evaluation and human review.

Set NEUROTRIAL_DATABASE_URL to use a managed database. The default is a local SQLite file for development. The Compose deployment stores its SQLite database in a named volume. Do not commit database files.

## Tests

```bash
cd backend
PYTHONPATH=. pytest
```

API tests use a fresh in-memory SQLite database for each test so a developer's existing local database cannot influence test results.

## Security and research limitations

The browser never receives the Anthropic key. Configure it only in the backend runtime environment. The document service is single-user and currently has no authentication or per-user document isolation. CORS is restricted to localhost by default. Rate limits, quotas, malware scanning, private object storage, durable audit controls, and access isolation must be implemented before any shared deployment.

Do not upload patient-identifiable or confidential clinical data. Synthetic bundled trial scenarios are not clinical evidence. This prototype is not a validated clinical decision-support system.
