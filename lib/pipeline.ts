import {
  createJob,
  getChunks,
  getDocument,
  replaceChunks,
  replaceGraph,
  updateDocument,
  updateJob,
} from "./db";
import { chunkText } from "./chunker";
import { extractGraphFallback } from "./fallbackExtractor";
import { normalizeGraph } from "./graphNormalizer";
import { extractGraphWithLlm } from "./llm";

export async function generateGraphForDocument(documentId: string) {
  const document = await getDocument(documentId);
  if (!document) {
    throw new Error("文書が見つかりません");
  }

  const job = await createJob({
    documentId,
    status: "running",
    step: "chunk",
    inputSummary: `${document.cleanedText.length} characters`,
  });

  try {
    const chunkInputs = chunkText(document.cleanedText);
    const chunks = await replaceChunks(documentId, chunkInputs);
    await updateDocument(documentId, { processingStatus: "chunked" });
    await updateJob(job.id, {
      step: "extract_entities",
      outputSummary: `${chunks.length} chunks`,
    });

    const extracted = (await extractGraphWithLlm(chunks)) ?? extractGraphFallback(chunks);
    await updateDocument(documentId, { processingStatus: "extracted" });
    await updateJob(job.id, {
      step: "normalize_graph",
      outputSummary: `${extracted.nodes.length} nodes, ${extracted.edges.length} edges extracted`,
    });

    const graph = normalizeGraph(documentId, extracted, await getChunks(documentId));
    await replaceGraph(documentId, graph);
    await updateDocument(documentId, { processingStatus: "graph_generated", errorMessage: undefined });
    await updateJob(job.id, {
      status: "completed",
      step: "save_graph",
      outputSummary: `${graph.nodes.length} nodes, ${graph.edges.length} edges saved`,
    });

    return graph;
  } catch (error) {
    const message = error instanceof Error ? error.message : "グラフ生成に失敗しました";
    await updateDocument(documentId, { processingStatus: "failed", errorMessage: message });
    await updateJob(job.id, { status: "failed", errorMessage: message });
    throw error;
  }
}
