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

const TABS = [
  { id: "parse",      label: "▹ Parse" },
  { id: "compare",    label: "▹ Compare" },
  { id: "failure",    label: "▹ Failure Analysis" },
  { id: "hypothesis", label: "▹ Hypotheses" },
  { id: "custom",     label: "▹ Add Trial" },
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
            {tab === "parse"      && <ParseTab      trials={trials} apiKey={apiKey} />}
            {tab === "compare"    && <CompareTab    trials={trials} apiKey={apiKey} />}
            {tab === "failure"    && <FailureTab    trials={trials} apiKey={apiKey} />}
            {tab === "hypothesis" && <HypothesisTab trials={trials} apiKey={apiKey} />}
            {tab === "custom"     && <CustomTab     onAdd={addTrial} />}
          </div>
        </div>
      </div>
    </div>
  );
}