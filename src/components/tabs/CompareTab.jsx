import { useState } from "react";
import { C, styles } from "../../styles/tokens";
import { callClaude } from "../../api/claude";
import Section from "../Section";
import Spinner from "../Spinner";

export default function CompareTab({ trials, apiKey }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const compare = async () => {
    setLoading(true); setError(null);
    try {
      const trialsText = trials.map((t) => `=== ${t.id}: ${t.title} ===\n${t.content}`).join("\n\n");
      const prompt = `Compare these ${trials.length} neuroscience clinical trials and return ONLY a JSON object.
Clearly distinguish FACTS (directly stated in trial data) from INFERENCES (your analysis).
Never fabricate statistics or outcomes not present in the source text.

Schema:
{
  "summary": string,
  "successfulTrials": [{ "id": string, "reason": string }],
  "failedTrials": [{ "id": string, "primaryFailureMode": string }],
  "commonThemes": [string],
  "endpointComparison": [{ "endpoint": string, "usedIn": [string], "sensitivity": "High"|"Medium"|"Low"|"Unknown" }],
  "biomarkerConsistency": { "consistent": [string], "inconsistent": [string], "missing": [string] },
  "populationDifferences": [string],
  "keyInsight": string,
  "uncertainties": [string]
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
    <Section title="Cross-Trial Comparison">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, fontSize: 12, color: C.textMuted }}>
          Comparing {trials.length} trials: {trials.map((t) => t.id).join(", ")}
        </div>
        <button
          style={{ ...styles.btn(), ...(loading ? styles.btnDisabled : {}) }}
          onClick={compare} disabled={loading}
        >
          {loading ? <><Spinner />&nbsp; Analyzing...</> : "▶ Run Comparison"}
        </button>
      </div>
      {error && <div style={styles.warningBox}>⚠ {error}</div>}
      {result && (
        <div>
          <div style={{ ...styles.inferenceBox, marginBottom: 16, fontSize: 12 }}>
            <strong style={{ color: C.gold }}>Summary:</strong> {result.summary}
          </div>
          <div style={styles.grid2}>
            <div>
              <div style={styles.label}>✓ Successful</div>
              {result.successfulTrials?.map((t, i) => (
                <div key={i} style={{ ...styles.factBox, marginBottom: 6 }}>
                  <span style={{ color: C.accent }}>{t.id}</span> — {t.reason}
                </div>
              ))}
            </div>
            <div>
              <div style={styles.label}>✗ Failed / Terminated</div>
              {result.failedTrials?.map((t, i) => (
                <div key={i} style={{ ...styles.warningBox, marginBottom: 6 }}>
                  <span style={{ color: C.red }}>{t.id}</span> — {t.primaryFailureMode}
                </div>
              ))}
            </div>
          </div>
          <div style={styles.label}>Common Themes</div>
          {result.commonThemes?.map((t, i) => (
            <div key={i} style={{ ...styles.inferenceBox, marginBottom: 6 }}>{t}</div>
          ))}
          <div style={styles.label}>Endpoint Comparison</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginBottom: 14 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Endpoint", "Used In", "Sensitivity"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 10px", color: C.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.endpointComparison?.map((e, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}22` }}>
                  <td style={{ padding: "6px 10px" }}>{e.endpoint}</td>
                  <td style={{ padding: "6px 10px", color: C.accentDim }}>{e.usedIn?.join(", ")}</td>
                  <td style={{ padding: "6px 10px" }}>
                    <span style={styles.chip(
                      e.sensitivity === "High" ? C.green : e.sensitivity === "Medium" ? C.gold : C.red
                    )}>{e.sensitivity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.uncertainties?.length > 0 && (
            <>
              <div style={styles.label}>⚠ Uncertainties</div>
              {result.uncertainties.map((u, i) => <div key={i} style={styles.warningBox}>{u}</div>)}
            </>
          )}
        </div>
      )}
    </Section>
  );
}