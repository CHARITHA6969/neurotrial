# Neurotrial

[![CI](https://github.com/CHARITHA6969/neurotrial/actions/workflows/neurotrial-ci.yml/badge.svg)](https://github.com/CHARITHA6969/neurotrial/actions/workflows/neurotrial-ci.yml)

**A React prototype for exploring LLM-assisted neuroscience clinical-trial intelligence.**

Neurotrial explores a researcher-oriented workflow for inspecting clinical-trial records, comparing studies, identifying reported failure factors, and developing hypotheses for further investigation.

> **Project status:** Frontend prototype / experimental integration. The current app uses explicitly synthetic demonstration records and a direct browser-to-Anthropic API call behind an API-key gate. It is not a validated clinical research tool and must not be used to make medical, treatment, or investment decisions.

## Problem space

Clinical-trial information is distributed across structured records and scientific documents. Researchers may need to compare study designs, populations, interventions, endpoints, and reported outcomes before forming a useful view of the evidence.

Neurotrial is an exploration of how an LLM interface might help organize this work while preserving a distinction between source facts and model-generated interpretation.

## Current capabilities in the interface

- **Parse:** inspect a trial and request a structured analysis.
- **Compare:** examine multiple trials side by side.
- **Failure analysis:** explore factors associated with unsuccessful or terminated trials.
- **Hypotheses:** develop possible explanations or research questions from the available information.
- **Add trial:** add a trial record to the current in-memory session.
- **Sample dataset:** load fictional demonstration scenarios from the local application data; these are not real clinical trials or source evidence.

The interface is organized into reusable React components and separate analysis tabs.

## Architecture today

```mermaid
flowchart TD
    A[Researcher] --> B[React application]
    B --> C[Trial workspace]
    C --> D[Parse]
    C --> E[Compare]
    C --> F[Failure analysis]
    C --> G[Hypothesis exploration]
    C --> H[Add trial]
    C --> I[Bundled sample trial data]
    D --> J[Claude API helper]
    E --> J
    F --> J
    G --> J
    J --> K[Structured model response]
```

This diagram describes the current prototype, not a production architecture. The current API helper calls Anthropic directly from the browser; a secure backend has not yet been implemented. The bundled records are synthetic scenarios and must not be cited as clinical evidence.

## Technology

- **Frontend:** React 18
- **Language:** JavaScript / JSX
- **LLM integration experiment:** Anthropic Messages API
- **Automated tests:** Jest via Create React App (response parsing and provider error handling)
- **Data:** local sample trial records
- **UI structure:** reusable components, tab-based workflows, shared style tokens

## Repository structure

```text
neurotrial/
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
│   │   │   └── CustomTab.jsx
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

Create a production build:

```bash
npm run build
```

Run API-helper tests:

```bash
npm test -- --watchAll=false
```

The tests cover JSON object parsing (including fenced output), malformed model responses, missing request inputs, provider errors, and text-block extraction.

## Important security and research limitations

- **Do not use real patient data or confidential research data** with this prototype.
- The current API-key gate stores the key in client-side application state and sends requests directly from the browser. This is not an appropriate production secret-management pattern. A backend proxy with server-side secret storage, authentication, rate limits, and audit logging is required.
- All bundled trial records are synthetic demonstration scenarios, not real trials, registry records, or validated research data. Their IDs and scientific details must not be cited.
- LLM-generated outputs can be incomplete or incorrect. Every claim, number, endpoint, and outcome must be checked against the original trial source.
- Hypotheses are exploratory suggestions, not established scientific conclusions.
- Trial status, failure reasons, and outcome definitions require careful source-specific interpretation.

The analysis prompt is designed to discourage fabricated trial facts, separate facts from inferences, and flag uncertainty. This is a useful guardrail, not a substitute for evidence retrieval, citations, or expert review.

See [Data provenance and research integrity](docs/data-provenance.md) and [Security model and deployment boundary](docs/security-model.md) for explicit requirements and current limitations.

## Roadmap

1. Add a secure backend API and server-side credential management.
2. Ingest source records with stable identifiers and provenance.
3. Add retrieval with source-level citations for every extracted claim.
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
