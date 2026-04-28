import { z } from "zod";

export const documentSourceTypeSchema = z.enum(["pdf", "html_url", "html_file"]);
export const processingStatusSchema = z.enum([
  "uploaded",
  "parsed",
  "chunked",
  "extracted",
  "graph_generated",
  "failed",
]);

export const graphNodeTypeSchema = z.enum([
  "Concept",
  "Company",
  "Person",
  "Product",
  "Service",
  "Technology",
  "Problem",
  "Solution",
  "Rule",
  "Criterion",
  "DocumentSection",
  "Organization",
  "Unknown",
]);

export const graphRelationTypeSchema = z.enum([
  "provides",
  "belongs_to",
  "part_of",
  "solves",
  "causes",
  "depends_on",
  "related_to",
  "based_on",
  "requires",
  "explains",
  "mentions",
  "evidence_for",
]);

export const extractedNodeSchema = z.object({
  node_key: z.string().min(1),
  label: z.string().min(1),
  type: graphNodeTypeSchema.catch("Unknown"),
  description: z.string().default(""),
  properties: z.record(z.unknown()).default({}),
  source_chunk_indexes: z.array(z.number().int().nonnegative()).default([]),
  confidence: z.number().min(0).max(1).catch(0.5),
});

export const extractedEdgeSchema = z.object({
  from_node_key: z.string().min(1),
  to_node_key: z.string().min(1),
  relation_type: graphRelationTypeSchema.catch("related_to"),
  label: z.string().min(1),
  description: z.string().default(""),
  evidence_text: z.string().default(""),
  source_chunk_indexes: z.array(z.number().int().nonnegative()).default([]),
  confidence: z.number().min(0).max(1).catch(0.5),
});

export const extractedGraphSchema = z.object({
  nodes: z.array(extractedNodeSchema).default([]),
  edges: z.array(extractedEdgeSchema).default([]),
});

export const updateNodeSchema = z.object({
  label: z.string().min(1).optional(),
  type: graphNodeTypeSchema.optional(),
  description: z.string().optional(),
  properties: z.record(z.unknown()).optional(),
});

export const updateEdgeSchema = z.object({
  label: z.string().min(1).optional(),
  relationType: graphRelationTypeSchema.optional(),
  description: z.string().optional(),
  evidenceText: z.string().optional(),
  properties: z.record(z.unknown()).optional(),
});
