import { NextResponse } from "next/server";
import { deleteEdge, getEdge, updateEdge } from "@/lib/db";
import { updateEdgeSchema } from "@/lib/validators";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  const edge = await getEdge(id);
  if (!edge) return NextResponse.json({ error: "エッジが見つかりません" }, { status: 404 });
  return NextResponse.json({ edge });
}

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  const input = updateEdgeSchema.parse(await request.json());
  const edge = await updateEdge(id, input);
  if (!edge) return NextResponse.json({ error: "エッジが見つかりません" }, { status: 404 });
  return NextResponse.json({ edge });
}

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params;
  const deleted = await deleteEdge(id);
  if (!deleted) return NextResponse.json({ error: "エッジが見つかりません" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
