import { NextResponse } from "next/server";
import { createDocument } from "@/lib/db";
import { parseHtml } from "@/lib/htmlParser";
import { parsePdf } from "@/lib/pdfParser";
import { cleanText, titleFromText } from "@/lib/textCleaner";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "ファイルを指定してください" }, { status: 400 });
    }

    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json({ error: "ファイルサイズは12MB以下にしてください" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || "uploaded";
    const lowerName = fileName.toLowerCase();
    let parsed: { title?: string; rawText: string; cleanedText: string; metadata: Record<string, unknown> };
    let sourceType: "pdf" | "html_file";

    if (file.type === "application/pdf" || lowerName.endsWith(".pdf")) {
      parsed = await parsePdf(buffer);
      sourceType = "pdf";
    } else if (file.type.includes("html") || lowerName.endsWith(".html") || lowerName.endsWith(".htm")) {
      parsed = parseHtml(buffer.toString("utf8"));
      sourceType = "html_file";
    } else if (file.type.startsWith("text/") || lowerName.endsWith(".txt") || lowerName.endsWith(".md")) {
      const rawText = buffer.toString("utf8");
      parsed = { rawText, cleanedText: cleanText(rawText), metadata: { fileName, fileType: file.type } };
      sourceType = "html_file";
    } else {
      return NextResponse.json({ error: "PDFまたはHTMLファイルを指定してください" }, { status: 400 });
    }

    if (!parsed.cleanedText) {
      return NextResponse.json({ error: "本文を抽出できませんでした" }, { status: 422 });
    }

    const document = await createDocument({
      title: parsed.title || titleFromText(parsed.cleanedText, fileName),
      sourceType,
      filePath: fileName,
      rawText: parsed.rawText,
      cleanedText: parsed.cleanedText,
      metadata: { ...parsed.metadata, fileName, fileType: file.type, fileSize: file.size },
      processingStatus: "parsed",
    });

    return NextResponse.json({ document });
  } catch (error) {
    const message = error instanceof Error ? error.message : "アップロードに失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
