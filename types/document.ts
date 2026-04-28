export type DocumentSourceType = "pdf" | "html_url" | "html_file";

export type ProcessingStatus =
  | "uploaded"
  | "parsed"
  | "chunked"
  | "extracted"
  | "graph_generated"
  | "failed";

export type KnowledgeDocument = {
  id: string;
  title: string;
  sourceType: DocumentSourceType;
  sourceUrl?: string;
  filePath?: string;
  rawText: string;
  cleanedText: string;
  metadata: Record<string, unknown>;
  processingStatus: ProcessingStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
};

export type DocumentChunk = {
  id: string;
  documentId: string;
  chunkIndex: number;
  heading?: string;
  content: string;
  tokenCount: number;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type ExtractionJobStatus = "pending" | "running" | "completed" | "failed";

export type ExtractionJobStep =
  | "parse"
  | "chunk"
  | "extract_entities"
  | "extract_relations"
  | "normalize_graph"
  | "save_graph";

export type ExtractionJob = {
  id: string;
  documentId: string;
  status: ExtractionJobStatus;
  step?: ExtractionJobStep;
  inputSummary?: string;
  outputSummary?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
};
