# Neurotrial

[![CI](https://github.com/CHARITHA6969/neurotrial/actions/workflows/neurotrial-ci.yml/badge.svg)](https://github.com/CHARITHA6969/neurotrial/actions/workflows/neurotrial-ci.yml)

**A React + FastAPI prototype for source-grounded neuroscience research workflows.**

Neurotrial explores how an LLM-assisted research interface can help organize clinical-trial information, ingest scientific documents, retrieve relevant passages, and return answers with traceable source references.

> **Research integrity:** The bundled trial scenarios are synthetic demonstration records, not real trial evidence. This prototype is not a validated clinical research or clinical decision-support system.

## Current capabilities

- **Trial workspace:** parse, compare, and explore synthetic trial scenarios.
- **Document ingestion:** upload PDF, TXT, and Markdown sources.
- **Text extraction:** extract PDF text with pypdf and decode UTF-8 text sources.
- **Chunking:** split extracted text into overlapping passages.
- **Persistence:** store document metadata and chunks using SQLAlchemy.
- **Retrieval:** rank passages with a lightweight BM25-style lexical retriever, stop-word filtering, inverse-document-frequency weighting, and document-length normalization.
- **Deterministic retrieval and citation tests:** exercise tokenization, BM25 ranking order, empty queries, document filters, chunk whitespace normalization, and rejection of unknown citation labels.
- **Source citations:** return document and chunk identifiers with excerpts, and reject generated `[S#]` citation labels that do not map to retrieved sources.
- **LLM gateway:** route analysis through FastAPI, with the Anthropic credential held server-side.
- **Frontend workspace:** browse uploaded sources and ask questions with returned citation metadata.

**Architecture:** [Ingestion, retrieval, and citation-validation flow](docs/architecture.md).  
**API walkthrough:** [Upload sources, list documents, and ask source-grounded questions](docs/api-examples.md).

## Architecture

```text
React application
  ├── Trial analysis tabs
  └── Source Library
         |
         v
      FastAPI
       ├── Document upload
       ├── PDF / text extraction
       ├── Chunking and SHA-256 fingerprint
       ├── BM25-style lexical retrieval
       └── Analysis gateway
              |
              v
       Server-side Anthropic API
              |
              v
       Answer + source references

SQLAlchemy store
  ├── source_documents
  └── document_chunks
```

## Technology

| Layer | Technologies |
|---|---|
| Frontend | React 18, JavaScript |
| Backend | Python, FastAPI, HTTPX |
| Document processing | pypdf, UTF-8 text, chunking |
| Persistence | SQLAlchemy, SQLite by default, configurable PostgreSQL driver |
| LLM integration | Anthropic Messages API |
| Testing | Jest, pytest, FastAPI TestClient |
| CI | GitHub Actions |

## Run locally

### Run the full application with Docker Compose

Requirements: Docker Desktop or Docker Engine with the Compose plugin.

```bash
cp .env.example .env
docker compose up --build
```

Open the frontend at [http://localhost:3000](http://localhost:3000), API docs at [http://localhost:8000/docs](http://localhost:8000/docs), and health at [http://localhost:8000/health](http://localhost:8000/health).

Copy `.env.example` to `.env` in the repository root. Add your Anthropic key to that local `.env` file to enable model-backed analysis; do not place the key in React or commit `.env`. Without a key, the synthetic trial workspace, source upload, and retrieval remain available, while model-backed endpoints return a clear configuration error. The SQLite database is persisted in the `neurotrial_data` volume.

Stop services with `docker compose down`. Add `-v` only when you intentionally want to delete the local source-document database.


### 1. Start the backend

```bash
cd backend
python -m venv .venv
# Activate the environment, then:
pip install -r requirements.txt
```

Set `ANTHROPIC_API_KEY` in the backend process environment. The current default model is `claude-sonnet-5-5`; set `ANTHROPIC_MODEL` to override it. Never place provider credentials in the React application or a browser field. The example values are in [`backend/.env.example`](backend/.env.example).

macOS/Linux:

```bash
export ANTHROPIC_API_KEY="your-server-side-key"
uvicorn app.main:app --reload
```

PowerShell:

```powershell
$env:ANTHROPIC_API_KEY="your-server-side-key"
uvicorn app.main:app --reload
```

The API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Start the frontend

In another terminal:

```bash
npm install
npm start
```

Set `REACT_APP_API_URL` only if the backend is not running at `http://localhost:8000`.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/v1/analyze` | Server-side LLM analysis |
| POST | `/api/v1/documents` | Upload PDF/TXT/MD source |
| GET | `/api/v1/documents` | List uploaded sources |
| POST | `/api/v1/ask` | Ask a question over retrieved excerpts |

## Tests

Frontend:

```bash
npm test -- --watchAll=false
npm run build
```

Backend:

```bash
cd backend
PYTHONPATH=. pytest
```

CI runs frontend tests/build and backend API tests, including isolated tests for retrieval ranking and tokenization.

## Retrieval details and limitations

The current retriever is a lightweight BM25-style lexical baseline. It tokenizes text, filters common stop words, applies inverse-document-frequency weighting, and normalizes for passage length. This improves ranking over raw term counts while remaining deterministic and inspectable. It is not semantic search: paraphrases and related concepts may be missed. Embedding-based retrieval, vector indexing, hybrid search, and reranking remain future work.

The API returns document and chunk identifiers with excerpts. It also rejects explicit `[S#]` labels that do not correspond to the retrieved passages. This catches invented source IDs, but does not prove that a cited passage supports the attached claim or that every factual claim is cited. Citation entailment still needs a dedicated evaluation set and human review.

## Security and research limitations

- Do not upload patient-identifiable or confidential research data.
- The Anthropic key is read from the backend environment; the browser does not receive it.
- The document service is currently a single-user development feature without authentication or per-user access isolation.
- Rate limiting, quotas, malware scanning, private object storage, durable audit logs, and production secret management remain to be added.
- AI-generated interpretations and hypotheses must be checked against original source documents.

See [data provenance](docs/data-provenance.md) and [security model](docs/security-model.md).

## Engineering priorities

1. Add authentication and per-user document ownership.
2. Add embedding-based semantic retrieval and reranking.
3. Evaluate retrieval relevance and citation support with a reproducible test set.
4. Add private file storage, malware scanning, rate limits, and audit controls.
5. Improve extraction for tables and complex scientific PDF layouts.

---

[Portfolio](https://charitha6969.github.io/charithapittala.github.io) · [GitHub profile](https://github.com/CHARITHA6969)
