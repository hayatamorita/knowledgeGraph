import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DocumentChunk, ExtractionJob, KnowledgeDocument, ProcessingStatus } from "@/types/document";
import type { GraphData, GraphEdge, GraphNode } from "@/types/graph";

type Store = {
  documents: KnowledgeDocument[];
  chunks: DocumentChunk[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  jobs: ExtractionJob[];
};

const dataDir = path.join(process.cwd(), "data");
const storePath = path.join(dataDir, "store.json");

const emptyStore = (): Store => ({
  documents: [],
  chunks: [],
  nodes: [],
  edges: [],
  jobs: [],
});

async function readStore(): Promise<Store> {
  await mkdir(dataDir, { recursive: true });
  try {
    const raw = await readFile(storePath, "utf8");
    return { ...emptyStore(), ...JSON.parse(raw) };
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: Store) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

export function createId() {
  return crypto.randomUUID();
}

export async function listDocuments() {
  const store = await readStore();
  return store.documents.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getDocument(id: string) {
  const store = await readStore();
  return store.documents.find((document) => document.id === id) ?? null;
}

export async function createDocument(input: {
  title: string;
  sourceType: KnowledgeDocument["sourceType"];
  sourceUrl?: string;
  filePath?: string;
  rawText: string;
  cleanedText: string;
  metadata?: Record<string, unknown>;
  processingStatus?: ProcessingStatus;
}) {
  const now = new Date().toISOString();
  const document: KnowledgeDocument = {
    id: createId(),
    title: input.title,
    sourceType: input.sourceType,
    sourceUrl: input.sourceUrl,
    filePath: input.filePath,
    rawText: input.rawText,
    cleanedText: input.cleanedText,
    metadata: input.metadata ?? {},
    processingStatus: input.processingStatus ?? "parsed",
    createdAt: now,
    updatedAt: now,
  };
  const store = await readStore();
  store.documents.push(document);
  await writeStore(store);
  return document;
}

export async function updateDocument(
  id: string,
  patch: Partial<Pick<KnowledgeDocument, "cleanedText" | "processingStatus" | "errorMessage" | "metadata" | "title">>,
) {
  const store = await readStore();
  const document = store.documents.find((item) => item.id === id);
  if (!document) return null;
  Object.assign(document, patch, { updatedAt: new Date().toISOString() });
  await writeStore(store);
  return document;
}

export async function replaceChunks(documentId: string, chunks: Omit<DocumentChunk, "id" | "documentId" | "createdAt">[]) {
  const store = await readStore();
  const now = new Date().toISOString();
  store.chunks = store.chunks.filter((chunk) => chunk.documentId !== documentId);
  const saved = chunks.map((chunk) => ({
    ...chunk,
    id: createId(),
    documentId,
    createdAt: now,
  }));
  store.chunks.push(...saved);
  await writeStore(store);
  return saved;
}

export async function getChunks(documentId: string) {
  const store = await readStore();
  return store.chunks
    .filter((chunk) => chunk.documentId === documentId)
    .sort((a, b) => a.chunkIndex - b.chunkIndex);
}

export async function createJob(input: Omit<ExtractionJob, "id" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const job: ExtractionJob = {
    ...input,
    id: createId(),
    createdAt: now,
    updatedAt: now,
  };
  const store = await readStore();
  store.jobs.push(job);
  await writeStore(store);
  return job;
}

export async function updateJob(id: string, patch: Partial<ExtractionJob>) {
  const store = await readStore();
  const job = store.jobs.find((item) => item.id === id);
  if (!job) return null;
  Object.assign(job, patch, { updatedAt: new Date().toISOString() });
  await writeStore(store);
  return job;
}

export async function listJobs(documentId: string) {
  const store = await readStore();
  return store.jobs.filter((job) => job.documentId === documentId);
}

export async function replaceGraph(documentId: string, graph: GraphData) {
  const store = await readStore();
  store.nodes = store.nodes.filter((node) => node.documentId !== documentId);
  store.edges = store.edges.filter((edge) => edge.documentId !== documentId);
  store.nodes.push(...graph.nodes);
  store.edges.push(...graph.edges);
  await writeStore(store);
  return graph;
}

export async function getGraph(documentId: string): Promise<GraphData> {
  const store = await readStore();
  return {
    nodes: store.nodes.filter((node) => node.documentId === documentId),
    edges: store.edges.filter((edge) => edge.documentId === documentId),
  };
}

export async function getNode(id: string) {
  const store = await readStore();
  return store.nodes.find((node) => node.id === id) ?? null;
}

export async function updateNode(id: string, patch: Partial<GraphNode>) {
  const store = await readStore();
  const node = store.nodes.find((item) => item.id === id);
  if (!node) return null;
  Object.assign(node, patch, { updatedAt: new Date().toISOString() });
  await writeStore(store);
  return node;
}

export async function deleteNode(id: string) {
  const store = await readStore();
  const before = store.nodes.length;
  store.nodes = store.nodes.filter((node) => node.id !== id);
  store.edges = store.edges.filter((edge) => edge.fromNodeId !== id && edge.toNodeId !== id);
  await writeStore(store);
  return before !== store.nodes.length;
}

export async function getEdge(id: string) {
  const store = await readStore();
  return store.edges.find((edge) => edge.id === id) ?? null;
}

export async function updateEdge(id: string, patch: Partial<GraphEdge>) {
  const store = await readStore();
  const edge = store.edges.find((item) => item.id === id);
  if (!edge) return null;
  Object.assign(edge, patch, { updatedAt: new Date().toISOString() });
  await writeStore(store);
  return edge;
}

export async function deleteEdge(id: string) {
  const store = await readStore();
  const before = store.edges.length;
  store.edges = store.edges.filter((edge) => edge.id !== id);
  await writeStore(store);
  return before !== store.edges.length;
}
