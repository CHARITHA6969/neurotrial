import { callClaude, parseModelJson } from "./claude";

describe("parseModelJson", () => {
  test("parses a plain JSON object", () => {
    expect(parseModelJson('{"trialId":"N-1"}')).toEqual({ trialId: "N-1" });
  });

  test("accepts a JSON code fence", () => {
    expect(parseModelJson('```json\n{"outcome":"Unknown"}\n```')).toEqual({ outcome: "Unknown" });
  });

  test("rejects invalid JSON with an actionable error", () => {
    expect(() => parseModelJson("{not-json}")).toThrow(/not valid JSON/);
  });

  test("rejects arrays because the analysis contract requires an object", () => {
    expect(() => parseModelJson("[1,2,3]")).toThrow(/JSON object/);
  });
});

describe("callClaude", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("rejects empty prompts and missing keys before making a request", async () => {
    await expect(callClaude(" ", "key")).rejects.toThrow(/prompt is required/);
    await expect(callClaude("analyze this", "")).rejects.toThrow(/API key is required/);
  });

  test("surfaces provider errors without trying to parse them as success", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ error: { message: "Invalid API key" } }),
    });
    await expect(callClaude("analyze", "bad-key")).rejects.toThrow("Invalid API key");
  });

  test("returns text blocks and ignores non-text content blocks", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({
        content: [{ type: "thinking" }, { type: "text", text: '{"ok":true}' }],
      }),
    });
    await expect(callClaude("analyze", "test-key")).resolves.toBe('{"ok":true}');
  });
});
