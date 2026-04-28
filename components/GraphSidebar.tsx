"use client";

import { useEffect, useMemo, useState } from "react";
import type { DocumentChunk } from "@/types/document";
import type { GraphEdge, GraphNode } from "@/types/graph";

type Selection =
  | { kind: "node"; value: GraphNode }
  | { kind: "edge"; value: GraphEdge }
  | null;

export function GraphSidebar({
  selection,
  chunks,
  onSaved,
}: {
  selection: Selection;
  chunks: DocumentChunk[];
  onSaved: () => void;
}) {
  const [label, setLabel] = useState("");
  const [typeValue, setTypeValue] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceText, setEvidenceText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selection) return;
    setLabel(selection.value.label);
    setDescription(selection.value.description);
    setError("");
    if (selection.kind === "node") {
      setTypeValue(selection.value.type);
      setEvidenceText("");
    } else {
      setTypeValue(selection.value.relationType);
      setEvidenceText(selection.value.evidenceText);
    }
  }, [selection]);

  const evidenceChunks = useMemo(() => {
    if (!selection) return [];
    return chunks.filter((chunk) => selection.value.sourceChunkIds.includes(chunk.id));
  }, [selection, chunks]);

  async function save() {
    if (!selection) return;
    const url = selection.kind === "node" ? `/api/nodes/${selection.value.id}` : `/api/edges/${selection.value.id}`;
    const body =
      selection.kind === "node"
        ? { label, type: typeValue, description }
        : { label, relationType: typeValue, description, evidenceText };
    const response = await fetch(url, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const json = await response.json();
      setError(json.error ?? "保存に失敗しました");
      return;
    }
    onSaved();
  }

  async function remove() {
    if (!selection) return;
    const url = selection.kind === "node" ? `/api/nodes/${selection.value.id}` : `/api/edges/${selection.value.id}`;
    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok) {
      const json = await response.json();
      setError(json.error ?? "削除に失敗しました");
      return;
    }
    onSaved();
  }

  if (!selection) {
    return (
      <aside className="panel detail-pane">
        <h2 className="section-title">詳細</h2>
        <p className="muted">ノードまたはエッジを選択してください。</p>
      </aside>
    );
  }

  return (
    <aside className="panel detail-pane">
      <div className="stack">
        <div>
          <h2 className="section-title">{selection.kind === "node" ? "ノード詳細" : "エッジ詳細"}</h2>
          <span className="status">{selection.kind}</span>
        </div>
        <div className="field">
          <label>ラベル</label>
          <input className="input" value={label} onChange={(event) => setLabel(event.target.value)} />
        </div>
        <div className="field">
          <label>{selection.kind === "node" ? "種別" : "関係タイプ"}</label>
          <input className="input" value={typeValue} onChange={(event) => setTypeValue(event.target.value)} />
        </div>
        <div className="field">
          <label>説明</label>
          <textarea className="textarea" value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>
        {selection.kind === "edge" ? (
          <div className="field">
            <label>根拠テキスト</label>
            <textarea className="textarea" value={evidenceText} onChange={(event) => setEvidenceText(event.target.value)} />
          </div>
        ) : null}
        <div className="row">
          <button className="button-primary button-small" onClick={save}>
            保存
          </button>
          <button className="button-danger button-small" onClick={remove}>
            削除
          </button>
        </div>
        {error ? <div style={{ color: "var(--danger)", fontSize: 13 }}>{error}</div> : null}
        <div>
          <h3 className="section-title">根拠チャンク</h3>
          {evidenceChunks.length === 0 ? <p className="muted">根拠チャンクはありません。</p> : null}
          <div className="stack">
            {evidenceChunks.map((chunk) => (
              <div key={chunk.id} className="code-block">
                {chunk.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
