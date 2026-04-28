import { NextResponse } from "next/server";
import { getChunks, getDocument, listJobs } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  const document = await getDocument(id);
  if (!document) return NextResponse.json({ error: "文書が見つかりません" }, { status: 404 });
  return NextResponse.json({
    document,
    chunks: await getChunks(id),
    jobs: await listJobs(id),
  });
}
