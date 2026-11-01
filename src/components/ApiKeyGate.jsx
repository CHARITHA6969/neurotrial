import { C, styles } from "../styles/tokens";

export default function ApiKeyGate({ onKey }) {
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
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 20 }}>
          Server-side AI gateway · no API key is entered or stored in this browser
        </div>
        <div style={{ ...styles.warningBox, textAlign: "left", marginBottom: 18 }}>
          The analysis service must be running and configured with its server-side ANTHROPIC_API_KEY environment variable.
        </div>
        <button onClick={() => onKey(true)} style={styles.btn()}>
          Open Research Workspace
        </button>
        <div style={{ fontSize: 10, color: C.textDim, marginTop: 12 }}>
          Demo records are synthetic. Do not submit patient-identifiable or confidential data.
        </div>
      </div>
    </div>
  );
}
