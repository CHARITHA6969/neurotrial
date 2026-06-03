import { C, styles } from "../styles/tokens";

export default function StatusPill({ status }) {
  const color =
    status === "Positive" ? C.green
    : status === "Failed" || status === "Terminated" ? C.red
    : status === "Ongoing" ? C.gold
    : C.textMuted;
  return <span style={styles.chip(color)}>{status}</span>;
}