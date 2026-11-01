import { useState, useCallback } from "react";
import { styles, C } from "./styles/tokens";
import { SAMPLE_TRIALS } from "./data/sampleTrials";
import ApiKeyGate from "./components/ApiKeyGate";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ParseTab from "./components/tabs/ParseTab";
import CompareTab from "./components/tabs/CompareTab";
import FailureTab from "./components/tabs/FailureTab";
import HypothesisTab from "./components/tabs/HypothesisTab";
import CustomTab from "./components/tabs/CustomTab";
import DocumentsTab from "./components/tabs/DocumentsTab";

const TABS = [
  { id: "parse",      label: "▹ Parse" },
  { id: "compare",    label: "▹ Compare" },
  { id: "failure",    label: "▹ Failure Analysis" },
  { id: "hypothesis", label: "▹ Hypotheses" },
  { id: "custom",     label: "▹ Add Trial" },
  { id: "documents",  label: "▹ Sources & RAG" },
];

export default function App() {
  const [apiKey, setApiKey] = useState(null);
  const [trials, setTrials] = useState(SAMPLE_TRIALS);
  const [tab, setTab] = useState("parse");

  const addTrial = useCallback((t) => setTrials((prev) => [...prev, t]), []);

  if (!apiKey) return <ApiKeyGate onKey={setApiKey} />;

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        input::placeholder, textarea::placeholder { color: ${C.textDim}; }
        input:focus, textarea:focus { border-color: ${C.accentDim} !important; }
        button:hover:not(:disabled) { filter: brightness(1.15); }
      `}</style>

      <Header trialCount={trials.length} onLogout={() => setApiKey(null)} />

      <div style={styles.layout}>
        <Sidebar trials={trials} />

        <div style={styles.main}>
          <div style={styles.tabs}>
            {TABS.map((t) => (
              <div key={t.id} style={styles.tab(tab === t.id)} onClick={() => setTab(t.id)}>
                {t.label}
              </div>
            ))}
          </div>
          <div style={styles.content}>
            <div role="note" style={{ marginBottom: 14, padding: "10px 12px", border: `1px solid ${C.gold}66`, borderRadius: 4, background: `${C.gold}12`, color: C.text, fontSize: 11, lineHeight: 1.6 }}>
              <strong>DEMO DATA ONLY:</strong> Bundled trial records are fictional scenarios, not real clinical evidence. Do not cite their IDs or findings. Verify all research claims against primary sources.
            </div>
            {tab === "parse"      && <ParseTab      trials={trials} />}
            {tab === "compare"    && <CompareTab    trials={trials} />}
            {tab === "failure"    && <FailureTab    trials={trials} />}
            {tab === "hypothesis" && <HypothesisTab trials={trials} />}
            {tab === "custom"     && <CustomTab     onAdd={addTrial} />}
            {tab === "documents"  && <DocumentsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}