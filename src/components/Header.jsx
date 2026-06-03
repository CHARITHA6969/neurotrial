import { C, styles } from "../styles/tokens";

export default function Header({ trialCount, onLogout }) {
  return (
    <div style={styles.header}>
      <div style={styles.logo}>N</div>
      <div>
        <div style={styles.title}>NeuroTrial Intelligence</div>
        <div style={styles.subtitle}>Clinical Trial Analysis System · Neuroscience</div>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        <span style={styles.badge(C.green)}>{trialCount} Trials</span>
        <span style={styles.badge(C.accent)}>Claude AI</span>
        <span style={styles.badge(C.gold)}>Guardrails Active</span>
        <button
          onClick={onLogout}
          style={{ ...styles.btn("ghost"), fontSize: 10, padding: "4px 10px" }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}