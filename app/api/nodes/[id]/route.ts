import { NextResponse } from "next/server";
import { deleteNode, getNode, updateNode } from "@/lib/db";
import { updateNodeSchema } from "@/lib/validators";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  const node = await getNode(id);
  if (!node) return NextResponse.json({ error: "ノードが見つかりません" }, { status: 404 });
  return NextResponse.json({ node });
}

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  const input = updateNodeSchema.parse(await request.json());
  const node = await updateNode(id, input);
  if (!node) return NextResponse.json({ error: "ノードが見つかりません" }, { status: 404 });
  return NextResponse.json({ node });
}

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params;
  const deleted = await deleteNode(id);
  if (!deleted) return NextResponse.json({ error: "ノードが見つかりません" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
