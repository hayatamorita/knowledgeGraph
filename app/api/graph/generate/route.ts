import { NextResponse } from "next/server";
import { generateGraphForDocument } from "@/lib/pipeline";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { documentId?: string };
    if (!body.documentId) {
      return NextResponse.json({ error: "documentIdを指定してください" }, { status: 400 });
    }
    const graph = await generateGraphForDocument(body.documentId);
    return NextResponse.json({ graph });
  } catch (error) {
    const message = error instanceof Error ? error.message : "グラフ生成に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
