# Neurotrial

[![CI](https://github.com/CHARITHA6969/neurotrial/actions/workflows/neurotrial-ci.yml/badge.svg)](https://github.com/CHARITHA6969/neurotrial/actions/workflows/neurotrial-ci.yml)

**A React + FastAPI prototype for exploring LLM-assisted neuroscience clinical-trial intelligence.**

Neurotrial explores a researcher-oriented workflow for inspecting clinical-trial records, comparing studies, identifying reported failure factors, and developing hypotheses for further investigation.

> **Project status:** Full-stack prototype with a React interface and a FastAPI analysis gateway. It uses explicitly synthetic demonstration records and is not a validated clinical research tool; it must not be used to make medical, treatment, or investment decisions.

## Problem space

Clinical-trial information is distributed across structured records and scientific documents. Researchers may need to compare study designs, populations, interventions, endpoints, and reported outcomes before forming a useful view of the evidence.

Neurotrial is an exploration of how an LLM interface might help organize this work while preserving a distinction between source facts and model-generated interpretation.

## Current capabilities in the interface

- **Parse:** inspect a trial and request a structured analysis.
- **Compare:** examine multiple trials side by side.
- **Failure analysis:** explore factors associated with unsuccessful or terminated trials.
- **Hypotheses:** develop possible explanations or research questions from the available information.
- **Add trial:** add a trial record to the current in-memory session.
- **Sources & RAG:** upload PDF/TXT/Markdown sources, persist extracted text chunks, ask questions over retrieved excerpts, and inspect returned citation metadata.
- **Sample dataset:** load fictional demonstration scenarios from the local application data; these are not real clinical trials or source evidence.

The interface is organized into reusable React components and separate analysis tabs. Model requests are routed through the backend rather than sent directly from the browser.

## Architecture today

```mermaid
flowchart TD
    A[Researcher] --> B[React application]
    B --> C[Trial workspace]
    C --> D[Parse / Compare / Hypotheses]
    D --> E[React API client]
    B --> F[Source Library UI]
    F --> G[FastAPI document API]
    G --> H[PDF and text extraction]
    H --> I[Chunking and SHA-256 fingerprint]
    I --> J[(SQL document and chunk store)]
    F --> K[Question]
    K --> L[Lexical retrieval]
    J --> L
    L --> M[Retrieved source excerpts]
    M --> N[FastAPI analysis gateway]
    N --> O[Server-side Anthropic credential]
    O --> P[Answer with citation labels]
    P --> F
```

This diagram describes the current prototype, not a production architecture. The React client sends prompts to a FastAPI gateway. The gateway reads the Anthropic key from its server environment; it does not accept provider keys from the browser. The source workspace stores document metadata and text chunks in a local SQL database, uses lexical retrieval as a transparent baseline, and asks the model to cite retrieved source labels. The bundled records are synthetic scenarios and must not be cited as clinical evidence.

## Technology

- **Frontend:** React 18
- **Backend:** Python, FastAPI, HTTPX, SQLAlchemy
- **Document processing:** pypdf, overlapping text chunks, SHA-256 document fingerprints
- **Retrieval:** lexical term-overlap baseline with source/chunk citation metadata
- **Provider security:** server-side environment secret, prompt-size validation, provider timeout, restricted CORS
- **Language:** JavaScript / JSX
- **LLM integration experiment:** Anthropic Messages API
- **Automated tests:** Jest via Create React App; pytest API tests for upload, retrieval, citation metadata, and provider configuration
- **Data:** local sample trial records
- **UI structure:** reusable components, tab-based workflows, shared style tokens

## Repository structure

```text
neurotrial/
├── backend/
│   ├── app/main.py
│   ├── tests/test_api.py
│   ├── requirements.txt
│   └── Dockerfile
├── public/
├── src/
│   ├── api/
│   │   └── claude.js
│   ├── components/
│   │   ├── tabs/
│   │   │   ├── ParseTab.jsx
│   │   │   ├── CompareTab.jsx
│   │   │   ├── FailureTab.jsx
│   │   │   ├── HypothesisTab.jsx
│   │   │   ├── CustomTab.jsx\n│   │   │   └── DocumentsTab.jsx
│   │   ├── ApiKeyGate.jsx
│   │   ├── Header.jsx
│   │   └── Sidebar.jsx
│   ├── data/
│   │   └── sampleTrials.js
│   ├── styles/
│   └── App.jsx
└── package.json
```

## Run locally

Prerequisites: Node.js and npm.

```bash
npm install
npm start
```

The development server starts at [http://localhost:3000](http://localhost:3000).

Start the backend in a second terminal:

```bash
cd backend
python -m venv .venv
# Activate the environment, then install dependencies:
pip install -r requirements.txt
# Configure ANTHROPIC_API_KEY in this server environment.
uvicorn app.main:app --reload
```

Set `REACT_APP_API_URL` only if the backend is not at `http://localhost:8000`. The browser no longer receives or stores an Anthropic API key.

Create a production build:

```bash
npm run build
```

Run API-helper tests:

```bash
npm test -- --watchAll=false
```

The frontend tests cover JSON parsing, malformed output, server-proxy request construction, and backend errors. Backend tests cover health, missing server credentials, invalid/oversized prompts, text upload, unsupported file types, retrieval, citations, and chunk normalization. Run backend tests from `backend/` with `PYTHONPATH=. pytest`.

## Important security and research limitations

- **Do not use real patient data or confidential research data** with this prototype.
- The backend proxy reads `ANTHROPIC_API_KEY` from its runtime environment. Document ingestion is currently a single-user development feature: authentication, per-user document isolation, quotas, rate limiting, audit controls, managed secret storage, and private object storage are required before public deployment.
- All bundled trial records are synthetic demonstration scenarios, not real trials, registry records, or validated research data. Their IDs and scientific details must not be cited.
- LLM-generated outputs can be incomplete or incorrect. Every claim, number, endpoint, and outcome must be checked against the original trial source.
- Hypotheses are exploratory suggestions, not established scientific conclusions.
- Trial status, failure reasons, and outcome definitions require careful source-specific interpretation.

The analysis prompt is designed to discourage fabricated trial facts, separate facts from inferences, and flag uncertainty. This is a useful guardrail, not a substitute for evidence retrieval, citations, or expert review.

See [Data provenance and research integrity](docs/data-provenance.md) and [Security model and deployment boundary](docs/security-model.md) for explicit requirements and current limitations.

## Roadmap

1. Add authentication, per-user quotas, rate limiting, and request audit controls to the backend API.
2. Add semantic embedding retrieval, re-ranking, and source-level citations for every extracted claim.
3. Add document ownership, authentication, authorization, upload malware scanning, and private storage.
4. Define typed schemas and validate all model responses; the shared JSON-object parser now rejects malformed and non-object output.
5. Build evaluation cases for extraction accuracy, comparison consistency, and unsupported claims.
6. Add error handling, request tracing, tests, and CI.
7. Add human review and exportable research notes with links to source records.

## Design principles

- Evidence before interpretation.
- Explicit separation of facts, inferences, and hypotheses.
- Source traceability for important claims.
- Clear uncertainty when the source does not support a conclusion.
- Human review for scientific decisions.

---

Neurotrial is an engineering prototype for responsible AI-assisted research workflows. Feedback and contributions are welcome.
