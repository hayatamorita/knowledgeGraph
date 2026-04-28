export type GraphNodeType =
  | "Concept"
  | "Company"
  | "Person"
  | "Product"
  | "Service"
  | "Technology"
  | "Problem"
  | "Solution"
  | "Rule"
  | "Criterion"
  | "DocumentSection"
  | "Organization"
  | "Unknown";

export type GraphRelationType =
  | "provides"
  | "belongs_to"
  | "part_of"
  | "solves"
  | "causes"
  | "depends_on"
  | "related_to"
  | "based_on"
  | "requires"
  | "explains"
  | "mentions"
  | "evidence_for";

export type GraphNode = {
  id: string;
  documentId: string;
  nodeKey: string;
  label: string;
  type: GraphNodeType;
  description: string;
  properties: Record<string, unknown>;
  sourceChunkIds: string[];
  confidence: number;
  x?: number;
  y?: number;
  createdAt: string;
  updatedAt: string;
};

export type GraphEdge = {
  id: string;
  documentId: string;
  fromNodeId: string;
  toNodeId: string;
  relationType: GraphRelationType;
  label: string;
  description: string;
  properties: Record<string, unknown>;
  sourceChunkIds: string[];
  evidenceText: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};
