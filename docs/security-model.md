# Security model and deployment boundary

## Current prototype

Neurotrial is a browser-based research prototype. The current UI accepts an Anthropic API key in the browser and calls the provider directly from client-side JavaScript. The key is held in application memory and is not intentionally persisted by this code, but this is **not a production-safe secret-management design**.

A key entered into a browser is exposed to that browser session and may be exposed through browser extensions, compromised devices, debugging tools, or malicious injected scripts. Never enter an organization-owned production key or use this flow with confidential research data.

## Required production architecture

Move provider calls behind an authenticated backend:

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

The repository does not yet contain a backend proxy, authentication/authorization service, managed secret integration, durable audit log, or validated research-data governance controls. The documentation describes requirements, not implemented capabilities.
