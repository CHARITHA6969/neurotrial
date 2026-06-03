import { C, styles } from "../styles/tokens";

export default function Section({ title, color = C.accentDim, children }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>
        <span style={{ color }}>▸</span> {title}
      </div>
      {children}
    </div>
  );
}