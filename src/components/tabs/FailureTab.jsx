import { useState } from "react";
import { C, styles } from "../../styles/tokens";
import { callClaude } from "../../api/claude";
import Section from "../Section";
import Spinner from "../Spinner";

export default function FailureTab({ trials, apiKey }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async () => {
    setLoading(true); setError(null);
    try {
      const trialsText = trials.map((t) => `=== ${t.id} ===\n${t.content}`).join("\n\n");
      const prompt = `Perform deep failure analysis on these neuroscience clinical trials.
Clearly mark inferences vs facts. Do not fabricate causes not supported by data.

Return ONLY a JSON object:
{
  "failureModes": [
    {
      "trialId": string,
      "primaryCause": string,
      "causeCategory": "Endpoint Selection"|"Biomarker Strategy"|"Patient Selection"|"Safety Signal"|"Mechanism of Action"|"Statistical"|"Operational"|"Unknown",
      "evidence": string,
      "confidence": "High"|"Medium"|"Low",
      "isInference": boolean
    }
  ],
  "systemicPatterns": [{ "pattern": string, "affectedTrials": [string], "implication": string }],
  "weakEndpoints": [{ "endpoint": string, "issue": string, "betterAlternative": string | null }],
  "biomarkerGaps": [string],
  "actionableInsights": [string],
  "caveat": string
}

Trial data:
${trialsText}`;

      const raw = await callClaude(prompt, apiKey);
      const clean = raw.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <Section title="Failure Mode Analysis">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, fontSize: 12, color: C.textMuted }}>
          Root cause attribution with confidence scoring across all trials
        </div>
        <button
          style={{ ...styles.btn("alt"), ...(loading ? styles.btnDisabled : {}) }}
          onClick={analyze} disabled={loading}
        >
          {loading ? <><Spinner />&nbsp; Analyzing...</> : "▶ Run Failure Analysis"}
        </button>
      </div>
      {error && <div style={styles.warningBox}>⚠ {error}</div>}
      {result && (
        <div>
          <div style={styles.label}>Root Cause by Trial</div>
          {result.failureModes?.map((f, i) => (
            <div key={i} style={{ ...styles.card, marginBottom: 10, borderColor: C.red + "44" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: C.accent, fontWeight: 700 }}>{f.trialId}</span>
                <div>
                  <span style={styles.chip(f.confidence === "High" ? C.green : f.confidence === "Medium" ? C.gold : C.red)}>
                    {f.confidence} confidence
                  </span>
                  {f.isInference && <span style={styles.chip(C.gold)}>[INFERRED]</span>}
                  <span style={styles.chip(C.purple)}>{f.causeCategory}</span>
                </div>
              </div>
              <div style={{ fontSize: 12, marginBottom: 6 }}><strong>Cause:</strong> {f.primaryCause}</div>
              <div style={styles.factBox}><strong>Evidence:</strong> {f.evidence}</div>
            </div>
          ))}
          <div style={styles.label}>Systemic Patterns</div>
          {result.systemicPatterns?.map((p, i) => (
            <div key={i} style={{ ...styles.inferenceBox, marginBottom: 8 }}>
              <div style={{ color: C.gold, fontWeight: 700, marginBottom: 4 }}>{p.pattern}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>Affects: {p.affectedTrials?.join(", ")}</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>{p.implication}</div>
            </div>
          ))}
          <div style={styles.grid2}>
            <div>
              <div style={styles.label}>Weak Endpoints</div>
              {result.weakEndpoints?.map((e, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <span style={styles.chip(C.red)}>{e.endpoint}</span>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{e.issue}</div>
                  {e.betterAlternative && <div style={{ fontSize: 11, color: C.green }}>→ {e.betterAlternative}</div>}
                </div>
              ))}
            </div>
            <div>
              <div style={styles.label}>Biomarker Gaps</div>
              {result.biomarkerGaps?.map((b, i) => <div key={i} style={styles.warningBox}>{b}</div>)}
            </div>
          </div>
          {result.caveat && (
            <div style={{ ...styles.warningBox, marginTop: 12 }}>
              <strong>⚠ Analyst Note:</strong> {result.caveat}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}