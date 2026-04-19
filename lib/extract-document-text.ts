import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;
import mammoth from "mammoth";
import Anthropic from "@anthropic-ai/sdk";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_CHARACTERS = 5000;

function normalizeText(raw: string): string {
  return raw
    .replace(/\n{3,}/g, "\n\n")
    .replace(/(?!\n)[ \t]{2,}/g, " ")
    .trim();
}

async function extractPdfWithVision(buffer: Buffer): Promise<string> {
  const anthropic = new Anthropic();
  const base64 = buffer.toString("base64");
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64 },
          },
          {
            type: "text",
            text: "Extraé todo el texto de este documento en orden de lectura natural. Devolvé únicamente el texto extraído, sin comentarios ni formato adicional.",
          },
        ],
      },
    ],
  });
  return response.content.find((b) => b.type === "text")?.text ?? "";
}

export async function extractDocumentText(
  file: File
): Promise<{ text: string; characterCount: number; extractionMethod: "parser" | "vision" }> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("El archivo supera el límite de 10MB.");
  }

  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  let text: string;
  let extractionMethod: "parser" | "vision" = "parser";

  if (name.endsWith(".pdf")) {
    let parserText = "";
    try {
      const result = await pdfParse(buffer);
      parserText = result.text ?? "";
    } catch {
      parserText = "";
    }

    if (parserText.trim().length < 50) {
      text = await extractPdfWithVision(buffer);
      extractionMethod = "vision";
    } else {
      text = parserText;
    }
  } else if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (name.endsWith(".txt")) {
    text = new TextDecoder().decode(buffer);
  } else {
    throw new Error(
      "Formato no soportado. Solo se aceptan archivos PDF, DOCX o TXT."
    );
  }

  text = normalizeText(text);
  const characterCount = text.length;

  if (characterCount > MAX_CHARACTERS) {
    throw {
      code: "EXCEEDS_LIMIT",
      characterCount,
      message: `Este documento tiene ${characterCount.toLocaleString("es-UY")} caracteres. El límite es 5.000. Te recomendamos seleccionar un fragmento del texto y pegarlo directamente en el campo de texto.`,
    };
  }

  return { text, characterCount, extractionMethod };
}
