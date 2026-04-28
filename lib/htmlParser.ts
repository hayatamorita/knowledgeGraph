import { load } from "cheerio";
import { cleanText } from "./textCleaner";

const removable = "script, style, noscript, svg, nav, footer, header, form, iframe";

export async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "OntologyGraphMVP/0.1",
    },
  });
  if (!response.ok) {
    throw new Error(`HTMLの取得に失敗しました: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

export function parseHtml(html: string, sourceUrl?: string) {
  const $ = load(html);
  $(removable).remove();

  const title = $("title").first().text().trim() || $("h1").first().text().trim();
  const main = $("main").text() || $("article").text() || $("body").text();
  const rawText = main.replace(/\u00a0/g, " ");

  return {
    title,
    rawText,
    cleanedText: cleanText(rawText),
    metadata: {
      sourceUrl,
      headings: $("h1,h2,h3")
        .map((_, element) => $(element).text().trim())
        .get()
        .filter(Boolean)
        .slice(0, 50),
    },
  };
}
