# Security model and deployment boundary

## Current prototype

The React client now sends analysis prompts to a FastAPI service. The browser no longer accepts or stores an Anthropic API key. The backend reads `ANTHROPIC_API_KEY` from its runtime environment and calls the provider server-to-server.

The API currently applies a prompt-size limit, provider timeout, generic provider-error handling, and a configurable CORS origin allowlist. This is a safer credential boundary, but it is not yet a complete production security design.

## Required production architecture

Complete the backend security boundary before public deployment:

1. Browser sends a narrowly scoped request to the application API.
2. Backend authenticates the user and authorizes access to the requested dataset.
3. Backend retrieves provider credentials from a managed secret store.
4. Backend enforces request size limits, rate limits, timeouts, and allowed model configuration.
5. Backend validates provider output against versioned schemas before returning it.
6. Backend records request IDs, model/version metadata, and safe audit events without logging secrets or sensitive source text.

The browser must never receive the provider API key. Use least-privilege credentials, rotation, and environment-specific secret management.

## Research-data handling

Do not upload patient-level, identifiable, confidential, or otherwise restricted data to this prototype. Before supporting such data, establish authorization, data minimization, retention/deletion controls, access logging, encryption, vendor review, and applicable institutional/legal approvals.

## AI output controls

Model output is untrusted input. Parse and validate JSON, reject unknown or malformed fields, preserve source references, and require human review. Do not present generated hypotheses as clinical recommendations or extracted facts as verified evidence.

## Current limitations

The repository now contains a FastAPI proxy and environment-based provider credential handling. It does not yet contain authentication/authorization, per-user rate limits or quotas, a managed secret-store integration, durable audit logs, or validated research-data governance controls. The documentation distinguishes implemented safeguards from remaining requirements.
