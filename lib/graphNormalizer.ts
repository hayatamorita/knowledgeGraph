import type { DocumentChunk } from "@/types/document";
import type { ExtractedGraph } from "@/types/extraction";
import type { GraphData, GraphEdge, GraphNode, GraphNodeType, GraphRelationType } from "@/types/graph";
import { createId } from "./db";
import { applyForceLayout } from "./graphLayout";
import { graphNodeTypeSchema, graphRelationTypeSchema } from "./validators";

function toChunkIds(indexes: number[], chunks: DocumentChunk[]) {
  return indexes
    .map((index) => chunks.find((chunk) => chunk.chunkIndex === index)?.id)
    .filter((id): id is string => Boolean(id));
}

function normalizeKey(key: string, fallback: string) {
  const normalized = key
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || fallback;
}

export function normalizeGraph(documentId: string, extracted: ExtractedGraph, chunks: DocumentChunk[]): GraphData {
  const now = new Date().toISOString();
  const nodeByKey = new Map<string, GraphNode>();

  for (const item of extracted.nodes) {
    const nodeKey = normalizeKey(item.node_key || item.label, `node_${nodeByKey.size + 1}`);
    const existing = nodeByKey.get(nodeKey);
    const sourceChunkIds = toChunkIds(item.source_chunk_indexes, chunks);

    if (existing) {
      existing.sourceChunkIds = [...new Set([...existing.sourceChunkIds, ...sourceChunkIds])];
      existing.confidence = Math.max(existing.confidence, item.confidence);
      continue;
    }

    nodeByKey.set(nodeKey, {
      id: createId(),
      documentId,
      nodeKey,
      label: item.label,
      type: graphNodeTypeSchema.catch("Unknown").parse(item.type) as GraphNodeType,
      description: item.description,
      properties: item.properties,
      sourceChunkIds,
      confidence: item.confidence,
      createdAt: now,
      updatedAt: now,
    });
  }

  const edges: GraphEdge[] = [];
  const seenEdges = new Set<string>();

  for (const item of extracted.edges) {
    const fromKey = normalizeKey(item.from_node_key, "");
    const toKey = normalizeKey(item.to_node_key, "");
    const fromNode = nodeByKey.get(fromKey);
    const toNode = nodeByKey.get(toKey);
    if (!fromNode || !toNode || fromNode.id === toNode.id) continue;

    const signature = `${fromNode.id}:${toNode.id}:${item.relation_type}:${item.label}`;
    if (seenEdges.has(signature)) continue;
    seenEdges.add(signature);

    edges.push({
      id: createId(),
      documentId,
      fromNodeId: fromNode.id,
      toNodeId: toNode.id,
      relationType: graphRelationTypeSchema.catch("related_to").parse(item.relation_type) as GraphRelationType,
      label: item.label,
      description: item.description,
      properties: {},
      sourceChunkIds: toChunkIds(item.source_chunk_indexes, chunks),
      evidenceText: item.evidence_text,
      confidence: item.confidence,
      createdAt: now,
      updatedAt: now,
    });
  }

  return { nodes: applyForceLayout([...nodeByKey.values()], edges), edges };
}
