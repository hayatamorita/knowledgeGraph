"use client";

import type { KnowledgeDocument } from "@/types/document";

export function DocumentList({
  documents,
  selectedId,
  onSelect,
}: {
  documents: KnowledgeDocument[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="panel" style={{ padding: 14 }}>
      <h2 className="section-title">文書一覧</h2>
      <div className="doc-list">
        {documents.length === 0 ? <div className="muted">文書はまだありません。</div> : null}
        {documents.map((document) => (
          <button
            key={document.id}
            className={`doc-item ${selectedId === document.id ? "active" : ""}`}
            onClick={() => onSelect(document.id)}
          >
            <strong>{document.title}</strong>
            <span className="muted" style={{ fontSize: 12 }}>
              {document.sourceType} / {new Date(document.createdAt).toLocaleString("ja-JP")}
            </span>
            <span className={`status ${document.processingStatus}`}>{document.processingStatus}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
