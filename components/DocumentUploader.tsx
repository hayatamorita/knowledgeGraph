"use client";

import { useState } from "react";

export function DocumentUploader({ onCreated }: { onCreated: (documentId: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function uploadFile() {
    if (!file) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/documents/upload", { method: "POST", body: formData });
    const json = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(json.error ?? "アップロードに失敗しました");
      return;
    }
    onCreated(json.document.id);
    setFile(null);
  }

  async function importUrl() {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    const response = await fetch("/api/documents/html", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(json.error ?? "HTML取り込みに失敗しました");
      return;
    }
    onCreated(json.document.id);
    setUrl("");
  }

  return (
    <div className="stack">
      <section className="panel" style={{ padding: 14 }}>
        <h2 className="section-title">文書入力</h2>
        <div className="stack">
          <div className="field">
            <label htmlFor="file">PDF / HTMLファイル</label>
            <input
              id="file"
              className="input"
              type="file"
              accept=".pdf,.html,.htm,text/html,application/pdf,text/plain"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>
          <button className="button-primary button-small" disabled={!file || loading} onClick={uploadFile}>
            アップロード
          </button>
          <div className="field">
            <label htmlFor="url">HTML URL</label>
            <input
              id="url"
              className="input"
              value={url}
              placeholder="https://example.com/page"
              onChange={(event) => setUrl(event.target.value)}
            />
          </div>
          <button className="button-primary button-small" disabled={!url.trim() || loading} onClick={importUrl}>
            URLを取り込む
          </button>
          {error ? <div style={{ color: "var(--danger)", fontSize: 13 }}>{error}</div> : null}
        </div>
      </section>
    </div>
  );
}
