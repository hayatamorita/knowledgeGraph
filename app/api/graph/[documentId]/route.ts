import { NextResponse } from "next/server";
import { getChunks, getDocument, getGraph } from "@/lib/db";

type Context = { params: Promise<{ documentId: string }> };

export async function GET(_request: Request, context: Context) {
  const { documentId } = await context.params;
  const document = await getDocument(documentId);
  if (!document) return NextResponse.json({ error: "文書が見つかりません" }, { status: 404 });
  return NextResponse.json({
    document,
    chunks: await getChunks(documentId),
    graph: await getGraph(documentId),
  });
}
