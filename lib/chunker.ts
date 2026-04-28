import type { DocumentChunk } from "@/types/document";

const maxChars = 1600;
const overlapChars = 160;

function estimateTokens(text: string) {
  return Math.ceil(text.length / 2);
}

function headingFor(block: string) {
  const firstLine = block.split("\n")[0]?.trim();
  if (!firstLine) return undefined;
  if (firstLine.length <= 80) return firstLine;
  return undefined;
}

export function chunkText(text: string): Omit<DocumentChunk, "id" | "documentId" | "createdAt">[] {
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const block of blocks) {
    if ((current + "\n\n" + block).trim().length > maxChars && current) {
      chunks.push(current.trim());
      current = current.slice(Math.max(0, current.length - overlapChars));
    }
    current = [current, block].filter(Boolean).join("\n\n");
  }

  if (current.trim()) chunks.push(current.trim());
  if (chunks.length === 0 && text.trim()) chunks.push(text.trim().slice(0, maxChars));

  return chunks.map((content, index) => ({
    chunkIndex: index,
    heading: headingFor(content),
    content,
    tokenCount: estimateTokens(content),
    metadata: { charCount: content.length },
  }));
}
