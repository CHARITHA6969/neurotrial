import { useState } from "react";
import { C, styles } from "../../styles/tokens";
import Section from "../Section";

export default function CustomTab({ onAdd }) {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [id, setId] = useState("");
  const [added, setAdded] = useState(false);

  const add = () => {
    if (!text.trim() || !title.trim()) return;
    onAdd({ id: id || `CUSTOM-${Date.now()}`, title, content: text });
    setText(""); setTitle(""); setId("");
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Section title="Add Custom Trial Data">
      <div style={{ ...styles.warningBox, marginBottom: 16 }}>
        Paste raw clinical trial text — reports, PubMed abstracts, ClinicalTrials.gov exports, or internal summaries.
      </div>
      <div style={styles.grid2}>
        <div>
          <label style={styles.label}>Trial ID (optional)</label>
          <input value={id} onChange={(e) => setId(e.target.value)}
            style={{ ...styles.textarea, height: 36, resize: "none", padding: "8px 12px" }}
            placeholder="NCT-XXXX-XXX" />
        </div>
        <div>
          <label style={styles.label}>Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            style={{ ...styles.textarea, height: 36, resize: "none", padding: "8px 12px" }}
            placeholder="Brief trial description" />
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={styles.label}>Trial Text *</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12}
          style={styles.textarea}
          placeholder="Paste clinical trial content here."
        />
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={add}
          disabled={!text.trim() || !title.trim()}
          style={{ ...styles.btn(), ...(!text.trim() || !title.trim() ? styles.btnDisabled : {}) }}>
          + Add Trial
        </button>
        {added && <span style={{ color: C.green, fontSize: 12 }}>✓ Trial added successfully</span>}
      </div>
    </Section>
  );
}