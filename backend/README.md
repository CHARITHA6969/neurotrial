# Neurotrial API

FastAPI gateway for server-side Anthropic requests plus a local document-ingestion and retrieval pipeline.

## Run locally

```bash
cd backend
python -m venv .venv
# Activate the environment, then:
pip install -r requirements.txt
# Set ANTHROPIC_API_KEY in the server environment.
uvicorn app.main:app --reload
```

PowerShell:
```powershell
$env:ANTHROPIC_API_KEY="your-key"
uvicorn app.main:app --reload
```

macOS/Linux:
```bash
export ANTHROPIC_API_KEY="your-key"
uvicorn app.main:app --reload
```

- Health: GET /health
- API docs: http://localhost:8000/docs
- Analyze: POST /api/v1/analyze
- Upload a PDF/TXT/MD source: POST /api/v1/documents (multipart field: `file`)
- List sources: GET /api/v1/documents
- Ask over sources: POST /api/v1/ask with `{"question":"What was the primary endpoint?"}`

## Retrieval behavior

Uploads are limited to 8 MB and accepted only as PDF, UTF-8 text, or Markdown. PDF text is extracted with pypdf. Text is normalized and split into overlapping chunks; chunks and document metadata are persisted in the local SQL database. The current retrieval implementation ranks chunks by lexical term overlap and returns stable source/chunk identifiers. It is a transparent baseline, not semantic embedding search yet. Answers are prompted to cite retrieved source labels such as [S1]. The API returns citation metadata and excerpts alongside the answer.

Set `NEUROTRIAL_DATABASE_URL` to use a managed database. The default is a local SQLite file for development. Do not commit database files.

## Security and research limitations

The browser never receives the Anthropic key. Configure it only in the backend runtime environment. CORS is restricted to localhost by default. Authentication, per-user document isolation, quotas, rate limiting, virus scanning, and durable audit controls remain to be implemented before public deployment.

Do not upload patient-identifiable or confidential clinical data until required privacy, security, and organizational reviews are complete. This prototype is not a validated clinical decision-support system.
