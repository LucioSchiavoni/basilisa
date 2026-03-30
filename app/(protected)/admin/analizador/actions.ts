"use server"

import { analyzeText, type IDLAnalysisResult } from "@/lib/services/idl"

export async function analyzeTextAction(
  text: string
): Promise<{ data?: IDLAnalysisResult; error?: string }> {
  if (!text.trim()) {
    return { error: "El texto no puede estar vacío" }
  }

  try {
    const result = await analyzeText(text)
    return { data: result }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al analizar el texto" }
  }
}
