import { useState } from "react";
import { C, styles } from "../../styles/tokens";
import { callClaude } from "../../api/claude";
import Section from "../Section";
import Spinner from "../Spinner";
import StatusPill from "../StatusPill";

export default function ParseTab({ trials, apiKey }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const parse = async (trial) => {
    setLoading(true); setError(null); setResult(null);
    setSelected(trial.id);
    try {
      const prompt = `Parse this clinical trial report and return ONLY a JSON object with this exact schema.
Extract only what is explicitly stated - do not infer or fabricate values. Use null for missing fields.

Schema:
{
  "trialId": string,
  "condition": string,
  "intervention": { "name": string, "dose": string, "route": string, "frequency": string },
  "sampleSize": number | null,
  "primaryEndpoint": string,
  "outcome": "Positive" | "Failed" | "Terminated" | "Ongoing" | "Unknown",
  "outcomeDetail": string,
  "adverseEffects": [{ "effect": string, "rate": string }],
  "biomarkers": [string],
  "keyFindings": [string],
  "dataQualityFlags": [string]
}

For dataQualityFlags: note any missing data, ambiguous results, or interpretation uncertainties.

Trial text:
${trial.content}`;

      const raw = await callClaude(prompt, apiKey);
      const clean = raw.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <Section title="Select Trial to Parse">
        {trials.map((t) => (
          <div
            key={t.id}
            onClick={() => !loading && parse(t)}
            style={{
              padding: "10px 14px",
              cursor: loading ? "not-allowed" : "pointer",
              border: `1px solid ${selected === t.id ? C.accent : C.border}`,
              borderRadius: 4, marginBottom: 8,
              background: selected === t.id ? C.surfaceHigh : "transparent",
            }}
          >
            <div style={styles.trialId}>{t.id}</div>
            <div style={styles.trialTitle}>{t.title}</div>
          </div>
        ))}
      </Section>

      <Section title="Parsed Output">
        {loading && (
          <div style={{ textAlign: "center", padding: 32, color: C.textMuted }}>
            <Spinner /> <span style={{ marginLeft: 10 }}>Extracting structured data...</span>
          </div>
        )}
        {error && <div style={styles.warningBox}>⚠ {error}</div>}
        {result && !loading && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: C.accent, fontWeight: 700, marginRight: 8 }}>{result.trialId}</span>
              <StatusPill status={result.outcome} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div>
                <div style={styles.label}>Condition</div>
                <div style={{ fontSize: 12 }}>{result.condition}</div>
              </div>
              <div>
                <div style={styles.label}>Sample Size</div>
                <div style={{ fontSize: 12, color: result.sampleSize ? C.text : C.textMuted }}>
                  {result.sampleSize ?? "Not specified"}
                </div>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <div style={styles.label}>Intervention</div>
                <div style={{ fontSize: 12 }}>
                  {result.intervention?.name} · {result.intervention?.dose} · {result.intervention?.route}
                </div>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <div style={styles.label}>Primary Endpoint</div>
                <div style={{ fontSize: 12 }}>{result.primaryEndpoint}</div>
              </div>
            </div>
            <div style={styles.label}>Key Findings</div>
            {result.keyFindings?.map((f, i) => <div key={i} style={styles.factBox}>{f}</div>)}
            {result.adverseEffects?.length > 0 && (
              <>
                <div style={styles.label}>Adverse Effects</div>
                <div style={{ marginBottom: 12 }}>
                  {result.adverseEffects.map((ae, i) => (
                    <span key={i} style={styles.chip(C.red)}>{ae.effect}: {ae.rate}</span>
                  ))}
                </div>
              </>
            )}
            {result.biomarkers?.length > 0 && (
              <>
                <div style={styles.label}>Biomarkers</div>
                <div>{result.biomarkers.map((b, i) => <span key={i} style={styles.chip(C.purple)}>{b}</span>)}</div>
              </>
            )}
            {result.dataQualityFlags?.length > 0 && (
              <>
                <div style={{ ...styles.label, marginTop: 12 }}>⚠ Data Quality Flags</div>
                {result.dataQualityFlags.map((f, i) => <div key={i} style={styles.warningBox}>{f}</div>)}
              </>
            )}
          </div>
        )}
        {!loading && !result && !error && (
          <div style={{ color: C.textMuted, fontSize: 12, textAlign: "center", padding: 32 }}>
            Select a trial on the left to extract structured data
          </div>
        )}
      </Section>
    </div>
  );
}