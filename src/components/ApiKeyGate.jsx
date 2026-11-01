import { useState } from "react";
import { C, styles } from "../styles/tokens";

export default function ApiKeyGate({ onKey }) {
  const [val, setVal] = useState("");

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Mono', 'Fira Code', monospace",
    }}>
      <div style={{ ...styles.card, width: 420, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🧠</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.accent, marginBottom: 6, letterSpacing: 1 }}>
          NEUROTRIAL INTELLIGENCE
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 24 }}>
          Prototype only · key is used in the browser; do not use a production key
        </div>
        <label style={styles.label}>Anthropic API Key</label>
        <input
          type="password"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && val.startsWith("sk-") && onKey(val)}
          style={{ ...styles.textarea, height: 40, resize: "none", padding: "8px 12px", marginBottom: 12 }}
          placeholder="sk-ant-..."
        />
        <button
          onClick={() => onKey(val)}
          disabled={!val.startsWith("sk-")}
          style={{ ...styles.btn(), ...(!val.startsWith("sk-") ? styles.btnDisabled : {}) }}
        >
          Launch System
        </button>
        <div style={{ fontSize: 10, color: C.textDim, marginTop: 12 }}>
          Browser-side API access is not production-safe. Do not submit confidential or patient data.
        </div>
      </div>
    </div>
  );
}