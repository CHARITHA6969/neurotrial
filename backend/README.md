# Neurotrial API

A server-side gateway for Anthropic analysis requests. The browser sends a prompt to this service; the Anthropic credential is read only from the server environment.

## Run locally

```bash
cd backend
python -m venv .venv
# Activate the environment, then:
pip install -r requirements.txt
# Set ANTHROPIC_API_KEY in the server environment.
uvicorn app.main:app --reload
```

Set the key in your shell, not in React source or a browser field:

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

- Health: http://localhost:8000/health
- OpenAPI: http://localhost:8000/docs
- Analysis: POST /api/v1/analyze with JSON `{"prompt":"..."}`

## Security boundary

The API key never belongs in the frontend bundle. Configure it as a server environment secret. CORS is restricted to localhost by default and must be set to the deployed frontend origin. The endpoint limits prompt size and applies a provider timeout. Add authentication, per-user quotas, rate limiting, request audit controls, and deployment secret management before exposing it publicly.

Do not submit patient-identifiable or confidential clinical data until the system has completed the required privacy, security, and organizational review. This prototype is not a validated clinical decision support system.
