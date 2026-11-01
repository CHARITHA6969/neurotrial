export const API_SYSTEM_PROMPT = `You are a specialized neuroscience clinical-trial analyst. Never fabricate trial results, statistics, or clinical claims. Separate source-grounded facts from inferences and flag uncertainty.`;

export function parseModelJson(raw) {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("The model returned an empty response.");
  }
  const clean = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error("The model response was not valid JSON. Retry the request or inspect the raw response.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("The model response must be a JSON object.");
  }
  return parsed;
}

export async function callClaude(userPrompt) {
  if (typeof userPrompt !== "string" || !userPrompt.trim()) {
    throw new Error("A non-empty analysis prompt is required.");
  }
  const baseUrl = process.env.REACT_APP_API_URL ?? "http://localhost:8000";
  const response = await fetch(`${baseUrl}/api/v1/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: userPrompt }),
  });
  const rawBody = await response.text();
  let data = null;
  try {
    data = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    data = null;
  }
  if (!response.ok) {
    throw new Error(data?.detail || `Neurotrial API request failed (HTTP ${response.status}).`);
  }
  if (typeof data?.text !== "string" || !data.text.trim()) {
    throw new Error("Neurotrial API returned no analysis text.");
  }
  return data.text;
}
