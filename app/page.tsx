"use client";

import { useCallback, useEffect, useState } from "react";
import { DocumentList } from "@/components/DocumentList";
import { DocumentUploader } from "@/components/DocumentUploader";
import { GraphViewer } from "@/components/GraphViewer";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import type { DocumentChunk, ExtractionJob, KnowledgeDocument } from "@/types/document";
import type { GraphData } from "@/types/graph";

type DocumentDetail = {
  document?: KnowledgeDocument;
  chunks: DocumentChunk[];
  jobs: ExtractionJob[];
  graph: GraphData;
};

const emptyGraph: GraphData = { nodes: [], edges: [] };

export default function Home() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [detail, setDetail] = useState<DocumentDetail>({ chunks: [], jobs: [], graph: emptyGraph });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadDocuments = useCallback(async () => {
    const response = await fetch("/api/documents");
    const json = await response.json();
    setDocuments(json.documents ?? []);
    if (!selectedId && json.documents?.[0]?.id) setSelectedId(json.documents[0].id);
  }, [selectedId]);

  const loadDetail = useCallback(async (documentId: string) => {
    const [documentResponse, graphResponse] = await Promise.all([
      fetch(`/api/documents/${documentId}`),
      fetch(`/api/graph/${documentId}`),
    ]);
    const documentJson = await documentResponse.json();
    const graphJson = await graphResponse.json();
    setDetail({
      document: documentJson.document,
      chunks: documentJson.chunks ?? [],
      jobs: documentJson.jobs ?? [],
      graph: graphJson.graph ?? emptyGraph,
    });
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (selectedId) void loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  async function generateGraph() {
    if (!selectedId) return;
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/graph/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ documentId: selectedId }),
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(json.error ?? "グラフ生成に失敗しました");
      await loadDetail(selectedId);
      await loadDocuments();
      return;
    }
    setMessage(`${json.graph.nodes.length}件のノード、${json.graph.edges.length}件のエッジを生成しました。`);
    await loadDetail(selectedId);
    await loadDocuments();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar stack">
        <div>
          <h1 style={{ margin: "0 0 6px", fontSize: 24 }}>Ontology Graph</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            PDF / HTMLから概念と関係を抽出し、グラフで確認・編集します。
          </p>
        </div>
        <DocumentUploader
          onCreated={(documentId) => {
            setSelectedId(documentId);
            void loadDocuments();
          }}
        />
        <DocumentList documents={documents} selectedId={selectedId} onSelect={setSelectedId} />
      </aside>
      <main className="main">
        <header className="topbar">
          <ProcessingStatus document={detail.document} jobs={detail.jobs} />
          <div className="row-wrap">
            {message ? <span className="muted">{message}</span> : null}
            <button className="button-primary button-small" disabled={!selectedId || loading} onClick={generateGraph}>
              {loading ? "生成中" : "グラフ生成 / 再生成"}
            </button>
          </div>
        </header>
        <div className="content">
          {detail.document ? (
            detail.graph.nodes.length > 0 ? (
              <GraphViewer
                graph={detail.graph}
                chunks={detail.chunks}
                onChanged={async () => {
                  if (selectedId) await loadDetail(selectedId);
                }}
              />
            ) : (
              <section className="panel" style={{ padding: 18 }}>
                <h2 className="section-title">{detail.document.title}</h2>
                <p className="muted">
                  本文は取り込み済みです。右上の「グラフ生成 / 再生成」からノード・エッジを生成してください。
                </p>
                <div className="code-block">{detail.document.cleanedText.slice(0, 3000)}</div>
              </section>
            )
          ) : (
            <section className="panel" style={{ padding: 18 }}>
              <h2 className="section-title">文書を追加してください</h2>
              <p className="muted">PDF、HTMLファイル、HTML URLを入力すると解析を開始できます。</p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
