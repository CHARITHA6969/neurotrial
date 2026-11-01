import { useEffect, useState } from "react";
import { C, styles } from "../../styles/tokens";
import Section from "../Section";
import Spinner from "../Spinner";

const API_BASE_URL = process.env.REACT_APP_API_URL ?? "http://localhost:8000";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const raw = await response.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
  if (!response.ok) throw new Error(data?.detail || `Request failed (${response.status})`);
  return data;
}

export default function DocumentsTab() {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshDocuments = async () => {
    const rows = await apiRequest("/api/v1/documents");
    setDocuments(rows);
  };

  useEffect(() => {
    refreshDocuments().catch((e) => setError(e.message));
  }, []);

  const upload = async () => {
    if (!file) return;
    setLoading(true); setError(null); setAnswer(null);
    try {
      const form = new FormData();
      form.append("file", file);
      await apiRequest("/api/v1/documents", { method: "POST", body: form });
      setFile(null);
      await refreshDocuments();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true); setError(null); setAnswer(null);
    try {
      const result = await apiRequest("/api/v1/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      setAnswer(result);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <Section title="Source Library">
        <p style={{ color: C.textMuted, fontSize: 12, lineHeight: 1.6 }}>
          Upload research PDFs or UTF-8 text/Markdown files. Files are stored by the backend and split into searchable excerpts.
        </p>
        <input
          type="file"
          accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          style={{ display: "block", width: "100%", margin: "12px 0" }}
        />
        <button disabled={!file || loading} onClick={upload} style={styles.btn()}>
          {loading ? "Working..." : "Upload source"}
        </button>
        <div style={{ marginTop: 18 }}>
          <div style={styles.label}>Indexed documents ({documents.length})</div>
          {documents.map((doc) => (
            <div key={doc.id} style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{doc.filename}</div>
              <div style={{ color: C.textMuted, fontSize: 10 }}>Document #{doc.id} · {doc.chunk_count} excerpts</div>
            </div>
          ))}
          {!documents.length && <div style={{ color: C.textMuted, fontSize: 11 }}>No documents uploaded yet.</div>}
        </div>
      </Section>

      <Section title="Ask Your Sources">
        <p style={{ color: C.textMuted, fontSize: 12, lineHeight: 1.6 }}>
          Answers are generated from retrieved source excerpts and returned with document and chunk citations.
        </p>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="e.g. What primary endpoint and participant population are described?"
          rows={5}
          style={{ width: "100%", resize: "vertical", padding: 10, margin: "8px 0 12px", background: C.surface, color: C.text, border: `1px solid ${C.border}`, borderRadius: 4 }}
        />
        <button disabled={!question.trim() || !documents.length || loading} onClick={ask} style={styles.btn()}>
          {loading ? "Searching sources..." : "Ask with citations"}
        </button>
        {loading && <div style={{ marginTop: 12 }}><Spinner /></div>}
        {error && <div role="alert" style={{ ...styles.warningBox, marginTop: 12 }}>{error}</div>}
        {answer && (
          <div style={{ marginTop: 16 }}>
            <div style={styles.label}>Answer</div>
            <div style={{ whiteSpace: "pre-wrap", fontSize: 12, lineHeight: 1.7, color: C.text }}>{answer.answer}</div>
            <div style={{ ...styles.label, marginTop: 16 }}>Retrieved citations</div>
            {answer.citations.map((citation) => (
              <div key={citation.citation_id} style={{ padding: 10, marginTop: 8, border: `1px solid ${C.border}`, borderRadius: 4 }}>
                <div style={{ color: C.accent, fontSize: 11, fontWeight: 700 }}>[{citation.citation_id}] {citation.filename} · chunk {citation.chunk_id}</div>
                <div style={{ color: C.textMuted, fontSize: 11, lineHeight: 1.5, marginTop: 4 }}>{citation.excerpt}</div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
