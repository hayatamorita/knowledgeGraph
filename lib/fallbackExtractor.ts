import type { DocumentChunk } from "@/types/document";
import type { ExtractedGraph, ExtractedNode } from "@/types/extraction";
import type { GraphNodeType } from "@/types/graph";

const typePatterns: Array<[GraphNodeType, RegExp]> = [
  ["Company", /(株式会社|有限会社|Inc\.|Corporation|Company|社)/i],
  ["Person", /(氏|CEO|CTO|担当者|person|manager)/i],
  ["Product", /(製品|プロダクト|product|platform|app|アプリ)/i],
  ["Service", /(サービス|service|SaaS|API)/i],
  ["Technology", /(AI|LLM|RAG|Graph|DB|データベース|React|Next\.js|PostgreSQL|技術)/i],
  ["Problem", /(課題|問題|risk|リスク|障害|failed|失敗)/i],
  ["Solution", /(解決|改善|solution|対応|実装)/i],
  ["Rule", /(ルール|規則|禁止|必須|must|required|制約)/i],
  ["Criterion", /(判断基準|基準|条件|criterion|criteria)/i],
  ["Organization", /(部署|組織|部門|organization|department)/i],
];

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
}

function guessType(label: string): GraphNodeType {
  return typePatterns.find(([, pattern]) => pattern.test(label))?.[0] ?? "Concept";
}

function candidatesFromChunk(content: string) {
  const quoted = [...content.matchAll(/[「『"]([^」』"]{2,40})[」』"]/g)].map((match) => match[1]);
  const words = [...content.matchAll(/[A-Z][A-Za-z0-9.+#-]{2,}|[一-龠ぁ-んァ-ヶーA-Za-z0-9]{3,24}/g)]
    .map((match) => match[0])
    .filter((word) => !/^(こと|もの|ため|これ|それ|また|および|として|する|ある)$/.test(word));
  return [...quoted, ...words];
}

export function extractGraphFallback(chunks: DocumentChunk[]): ExtractedGraph {
  const nodeMap = new Map<string, ExtractedNode>();

  for (const chunk of chunks.slice(0, 16)) {
    for (const label of candidatesFromChunk(chunk.content).slice(0, 12)) {
      const key = normalizeKey(label);
      if (!key || key.length < 2) continue;
      const existing = nodeMap.get(key);
      if (existing) {
        if (!existing.source_chunk_indexes.includes(chunk.chunkIndex)) {
          existing.source_chunk_indexes.push(chunk.chunkIndex);
        }
        continue;
      }
      nodeMap.set(key, {
        node_key: key,
        label,
        type: guessType(label),
        description: `文書中で言及されている「${label}」。`,
        properties: {},
        source_chunk_indexes: [chunk.chunkIndex],
        confidence: 0.45,
      });
    }
  }

  const nodes = [...nodeMap.values()].slice(0, 28);
  const edges = nodes.slice(1).map((node, index) => {
    const from = nodes[index % Math.max(1, Math.min(nodes.length, 6))];
    return {
      from_node_key: from.node_key,
      to_node_key: node.node_key,
      relation_type: "related_to" as const,
      label: "関連",
      description: "同一文書または近接チャンク内で言及されています。",
      evidence_text: chunks[node.source_chunk_indexes[0]]?.content.slice(0, 180) ?? "",
      source_chunk_indexes: node.source_chunk_indexes,
      confidence: 0.35,
    };
  });

  return { nodes, edges };
}
