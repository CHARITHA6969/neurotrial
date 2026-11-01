import { useState } from "react";
import { C, styles } from "../../styles/tokens";
import { callClaude, parseModelJson } from "../../api/claude";
import Section from "../Section";
import Spinner from "../Spinner";

export default function HypothesisTab({ trials, apiKey }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [condition, setCondition] = useState("Alzheimer's Disease");

  const generate = async () => {
    setLoading(true); setError(null);
    try {
      const trialsText = trials.map((t) => `${t.id}: ${t.content.slice(0, 300)}`).join("\n---\n");
      const prompt = `Based on patterns from these neuroscience clinical trials, generate improved trial design hypotheses for: ${condition}

Label each as [EVIDENCE-BASED] (supported by trial data) or [SPECULATIVE] (theoretical).
Be clinically precise. Do not recommend anything contradicted by the evidence.

Return ONLY a JSON object:
{
  "targetCondition": string,
  "improvedDesigns": [
    {
      "title": string,
      "hypothesis": string,
      "rationale": string,
      "type": "EVIDENCE-BASED" | "SPECULATIVE",
      "keyChange": string,
      "endpoints": [string],
      "patientStratification": string,
      "riskMitigation": string,
      "confidenceLevel": "High"|"Medium"|"Low"
    }
  ],
  "biomarkerRecommendations": [{ "biomarker": string, "rationale": string, "type": "EVIDENCE-BASED"|"SPECULATIVE" }],
  "endpointRecommendations": [{ "endpoint": string, "benefit": string }],
  "overallCaveat": string
}

Trial patterns:
${trialsText}`;

      const raw = await callClaude(prompt);
      setResult(parseModelJson(raw));
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <Section title="Hypothesis Generation & Trial Design Improvement">
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Target Condition</label>
          <input
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            style={{ ...styles.textarea, height: 36, resize: "none", padding: "8px 12px" }}
            placeholder="e.g. Alzheimer's Disease, Parkinson's..."
          />
        </div>
        <button
          style={{ ...styles.btn("alt"), ...(loading ? styles.btnDisabled : {}) }}
          onClick={generate} disabled={loading}
        >
          {loading ? <><Spinner />&nbsp; Generating...</> : "▶ Generate Hypotheses"}
        </button>
      </div>
      {error && <div style={styles.warningBox}>⚠ {error}</div>}
      {result && (
        <div>
          <div style={{ fontSize: 14, color: C.accent, fontWeight: 700, marginBottom: 16 }}>
            {result.improvedDesigns?.length} Design Strategies for {result.targetCondition}
          </div>
          {result.improvedDesigns?.map((d, i) => (
            <div key={i} style={{
              ...styles.card,
              borderColor: d.type === "EVIDENCE-BASED" ? C.green + "44" : C.gold + "44",
              marginBottom: 14,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{i + 1}. {d.title}</div>
                <div>
                  <span style={styles.chip(d.type === "EVIDENCE-BASED" ? C.green : C.gold)}>{d.type}</span>
                  <span style={styles.chip(d.confidenceLevel === "High" ? C.green : d.confidenceLevel === "Medium" ? C.gold : C.red)}>
                    {d.confidenceLevel}
                  </span>
                </div>
              </div>
              <div style={{ ...styles.inferenceBox, marginBottom: 10 }}>{d.hypothesis}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 11 }}>
                <div>
                  <div style={styles.label}>Key Change</div>
                  <div style={{ color: C.accent }}>{d.keyChange}</div>
                </div>
                <div>
                  <div style={styles.label}>Patient Stratification</div>
                  <div>{d.patientStratification}</div>
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <div style={styles.label}>Proposed Endpoints</div>
                  <div>{d.endpoints?.map((e, j) => <span key={j} style={styles.chip(C.accent)}>{e}</span>)}</div>
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <div style={styles.label}>Risk Mitigation</div>
                  <div style={styles.warningBox}>{d.riskMitigation}</div>
                </div>
              </div>
            </div>
          ))}
          {result.overallCaveat && (
            <div style={{ ...styles.warningBox, marginTop: 12 }}>
              <strong>⚠ Caveat:</strong> {result.overallCaveat}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}