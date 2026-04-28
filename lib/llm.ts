import OpenAI from "openai";
import type { DocumentChunk } from "@/types/document";
import type { ExtractedGraph } from "@/types/extraction";
import { buildExtractGraphPrompt } from "@/prompts/extractGraphPrompt";
import { extractedGraphSchema } from "./validators";

function parseJsonObject(text: string) {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("LLM出力にJSONオブジェクトが含まれていません");
  }
  return JSON.parse(trimmed.slice(start, end + 1));
}

export async function extractGraphWithLlm(chunks: DocumentChunk[]): Promise<ExtractedGraph | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const client = new OpenAI({ apiKey });
  const prompt = buildExtractGraphPrompt(
    chunks.slice(0, 12).map((chunk) => ({
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
    })),
  );

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content: "You are a precise information extraction engine. Return valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message.content ?? "";
  return extractedGraphSchema.parse(parseJsonObject(content));
}
