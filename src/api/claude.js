export const API_SYSTEM_PROMPT = `You are a specialized neuroscience clinical trial analyst. You analyze clinical trial data with high accuracy and scientific rigor.

CRITICAL RULES:
1. Never fabricate or hallucinate trial results, statistics, or clinical claims
2. Always clearly separate FACTS (from source text) from INFERENCES (your analysis)
3. Flag uncertain interpretations explicitly with [UNCERTAIN] or [INFERRED]
4. When citing specific numbers, always reference the source trial
5. If data is missing or ambiguous, say so rather than guessing
6. Use precise clinical terminology appropriate for pharma researchers

You respond only with valid JSON matching the schema requested. No markdown backticks, no preamble.`;

export async function callClaude(userPrompt, apiKey) {
  if (typeof userPrompt !== "string" || !userPrompt.trim()) {
    throw new Error("A non-empty analysis prompt is required.");
  }
  if (typeof apiKey !== "string" || !apiKey.trim()) {
    throw new Error("An Anthropic API key is required for this prototype request.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 2000,
      system: API_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  // Read the response body once and handle non-JSON provider/proxy errors safely.
  const rawBody = await response.text();
  let data = null;
  try {
    data = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || `Anthropic API request failed (HTTP ${response.status}).`);
  }

  const text = Array.isArray(data?.content)
    ? data.content.filter((block) => block?.type === "text").map((block) => block.text).join("")
    : "";

  if (!text.trim()) {
    throw new Error("The model returned no text content. Please retry or inspect the provider response.");
  }

  return text;
}
