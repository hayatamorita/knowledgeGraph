import { NextResponse } from "next/server";
import { createDocument } from "@/lib/db";
import { fetchHtml, parseHtml } from "@/lib/htmlParser";
import { titleFromText } from "@/lib/textCleaner";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };
    if (!body.url) {
      return NextResponse.json({ error: "URLを指定してください" }, { status: 400 });
    }

    const url = new URL(body.url);
    if (!["http:", "https:"].includes(url.protocol)) {
      return NextResponse.json({ error: "httpまたはhttpsのURLを指定してください" }, { status: 400 });
    }

    const html = await fetchHtml(url.toString());
    const parsed = parseHtml(html, url.toString());
    if (!parsed.cleanedText) {
      return NextResponse.json({ error: "本文を抽出できませんでした" }, { status: 422 });
    }

    const document = await createDocument({
      title: parsed.title || titleFromText(parsed.cleanedText, url.hostname),
      sourceType: "html_url",
      sourceUrl: url.toString(),
      rawText: parsed.rawText,
      cleanedText: parsed.cleanedText,
      metadata: parsed.metadata,
      processingStatus: "parsed",
    });

    return NextResponse.json({ document });
  } catch (error) {
    const message = error instanceof Error ? error.message : "HTML取り込みに失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
