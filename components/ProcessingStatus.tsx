"use client";

import type { ExtractionJob, KnowledgeDocument } from "@/types/document";

export function ProcessingStatus({ document, jobs }: { document?: KnowledgeDocument; jobs: ExtractionJob[] }) {
  if (!document) {
    return <span className="muted">文書を選択してください</span>;
  }

  const latest = jobs.at(-1);

  return (
    <div className="row-wrap">
      <span className={`status ${document.processingStatus}`}>{document.processingStatus}</span>
      {latest?.step ? <span className="muted">step: {latest.step}</span> : null}
      {document.errorMessage ? <span style={{ color: "var(--danger)" }}>{document.errorMessage}</span> : null}
    </div>
  );
}
