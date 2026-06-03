import { C, styles } from "../styles/tokens";

export default function Sidebar({ trials }) {
  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarSection}>Trial Database</div>
      <div style={{ overflowY: "auto", flex: 1 }}>
        {trials.map((t) => (
          <div key={t.id} style={styles.trialItem(false)}>
            <div style={styles.trialId}>{t.id}</div>
            <div style={styles.trialTitle}>{t.title}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: 16, borderTop: `1px solid ${C.border}` }}>
        <div style={{ ...styles.chip(C.green), display: "block", textAlign: "center", marginBottom: 6 }}>
          ✓ Facts separated from inferences
        </div>
        <div style={{ ...styles.chip(C.gold), display: "block", textAlign: "center" }}>
          ⚠ Uncertainty flags enabled
        </div>
      </div>
    </div>
  );
}