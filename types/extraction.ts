import type { GraphNodeType, GraphRelationType } from "./graph";

export type ExtractedNode = {
  node_key: string;
  label: string;
  type: GraphNodeType;
  description: string;
  properties: Record<string, unknown>;
  source_chunk_indexes: number[];
  confidence: number;
};

export type ExtractedEdge = {
  from_node_key: string;
  to_node_key: string;
  relation_type: GraphRelationType;
  label: string;
  description: string;
  evidence_text: string;
  source_chunk_indexes: number[];
  confidence: number;
};

export type ExtractedGraph = {
  nodes: ExtractedNode[];
  edges: ExtractedEdge[];
};
