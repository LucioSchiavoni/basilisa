"use server"

import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"
import { extractDocumentText } from "@/lib/extract-document-text"

type ExtractResult =
  | { success: true; text: string; characterCount: number; extractionMethod: "parser" | "vision" }
  | { success: false; code: "EXCEEDS_LIMIT"; characterCount: number; message: string }
  | { success: false; code: "UNAUTHORIZED" | "ERROR"; message: string }

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_CHARACTERS = 5000

function normalizeText(text: string): string {
  return text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/(?!\n)[ \t]{2,}/g, " ")
    .trim()
}

export async function extractDocumentAction(formData: FormData): Promise<ExtractResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, code: "UNAUTHORIZED", message: "No autorizado" }
  }

  const file = formData.get("file")

  if (!(file instanceof File)) {
    return { success: false, code: "ERROR", message: "No se recibió ningún archivo." }
  }

  try {
    const { text, characterCount, extractionMethod } = await extractDocumentText(file)
    return { success: true, text, characterCount, extractionMethod }
  } catch (err) {
    if (err !== null && typeof err === "object" && "code" in err) {
      const e = err as { code: string; message: string; characterCount?: number }
      if (e.code === "EXCEEDS_LIMIT") {
        return { success: false, code: "EXCEEDS_LIMIT", characterCount: e.characterCount!, message: e.message }
      }
    }

    const message = err instanceof Error ? err.message : "Error al procesar el archivo."
    return { success: false, code: "ERROR", message }
  }
}

export async function extractDocumentWithVisionAction(formData: FormData): Promise<ExtractResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, code: "UNAUTHORIZED", message: "No autorizado" }
  }

  const file = formData.get("file")

  if (!(file instanceof File)) {
    return { success: false, code: "ERROR", message: "No se recibió ningún archivo." }
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return { success: false, code: "ERROR", message: "Solo se pueden procesar archivos PDF con extracción por IA." }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, code: "ERROR", message: "El archivo supera el límite de 10MB." }
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString("base64")

    const anthropic = new Anthropic()
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64,
              },
            },
            {
              type: "text",
              text: "Extraé todo el texto de este documento en orden de lectura natural. Devolvé únicamente el texto extraído, sin comentarios ni formato adicional.",
            },
          ],
        },
      ],
    })

    const raw = response.content.find((b) => b.type === "text")?.text ?? ""
    const text = normalizeText(raw)
    const characterCount = text.length

    if (characterCount > MAX_CHARACTERS) {
      return {
        success: false,
        code: "EXCEEDS_LIMIT",
        characterCount,
        message: `Este documento tiene ${characterCount.toLocaleString("es-UY")} caracteres. El límite es 5.000. Te recomendamos seleccionar un fragmento del texto y pegarlo directamente en el campo de texto.`,
      }
    }

    return { success: true, text, characterCount, extractionMethod: "vision" as const }
  } catch {
    return { success: false, code: "ERROR", message: "No se pudo procesar el archivo con IA. Intentá de nuevo." }
  }
}
