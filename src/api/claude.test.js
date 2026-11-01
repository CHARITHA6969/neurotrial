import { callClaude, parseModelJson } from "./claude";

describe("parseModelJson", () => {
  test("parses a plain JSON object", () => {
    expect(parseModelJson('{"trialId":"N-1"}')).toEqual({ trialId: "N-1" });
  });

  test("accepts fenced JSON", () => {
    expect(parseModelJson('```json\n{"outcome":"Unknown"}\n```')).toEqual({ outcome: "Unknown" });
  });

  test("rejects malformed JSON and non-object values", () => {
    expect(() => parseModelJson("{bad}")).toThrow(/not valid JSON/);
    expect(() => parseModelJson("[1,2]")).toThrow(/JSON object/);
  });
});

describe("callClaude server proxy", () => {
  afterEach(() => jest.restoreAllMocks());

  test("rejects empty prompts without making a request", async () => {
    await expect(callClaude(" ")).rejects.toThrow(/prompt is required/);
    expect(global.fetch).toBeUndefined();
  });

  test("sends prompt to the backend without a browser API key", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ text: '{"ok":true}' }),
    });
    await expect(callClaude("Analyze trial")).resolves.toBe('{"ok":true}');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/analyze"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ prompt: "Analyze trial" }),
      })
    );
  });

  test("surfaces backend error details", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => JSON.stringify({ detail: "AI analysis is not configured on the server." }),
    });
    await expect(callClaude("Analyze")).rejects.toThrow(/not configured on the server/);
  });
});
