import { NextResponse } from "next/server";
import { listDocuments } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ documents: await listDocuments() });
}
