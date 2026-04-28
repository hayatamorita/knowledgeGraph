import pdfParse from "pdf-parse";
import { cleanText } from "./textCleaner";

export async function parsePdf(buffer: Buffer) {
  const result = await pdfParse(buffer);
  return {
    rawText: result.text,
    cleanedText: cleanText(result.text),
    metadata: {
      pages: result.numpages,
      info: result.info ?? {},
    },
  };
}
