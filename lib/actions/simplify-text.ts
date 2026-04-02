"use server"

import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"

type DifficultyLevel = "muy_facil" | "facil" | "medio" | "dificil"

interface SimplifyTextResult {
  success: boolean
  simplified_text?: string
  error?: string
  usage_today?: number
  daily_limit?: number
}

const DAILY_LIMIT = 5

const LEVEL_CONFIGS: Record<
  DifficultyLevel,
  { label: string; sentence_range: string; word_length_guide: string }
> = {
  muy_facil: {
    label: "Muy Fácil (IDL 0-20)",
    sentence_range: "5-8 palabras",
    word_length_guide:
      "Usar exclusivamente palabras de 3-5 letras. Eliminar toda palabra de 6+ letras reemplazándola por sinónimos de 3-5 letras.",
  },
  facil: {
    label: "Fácil (IDL 20-40)",
    sentence_range: "8-12 palabras",
    word_length_guide:
      "Preferir palabras de 4-6 letras. Reemplazar palabras de 7+ letras cuando exista un sinónimo de 4-6 letras natural.",
  },
  medio: {
    label: "Medio (IDL 40-60)",
    sentence_range: "10-15 palabras",
    word_length_guide:
      "Tolerar algunas palabras de 7-8 letras si son frecuentes. Eliminar palabras de 9+ letras.",
  },
  dificil: {
    label: "Difícil (IDL 60-80)",
    sentence_range: "12-18 palabras",
    word_length_guide:
      "Reducción moderada. Foco en eliminar solo palabras de 9+ letras reemplazándolas por sinónimos más cortos.",
  },
}

export async function getSimplificationUsage(): Promise<{ usage_today: number; daily_limit: number }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { usage_today: 0, daily_limit: DAILY_LIMIT }

  const today = new Date().toISOString().slice(0, 10)
  const { count } = await supabase
    .from("text_simplification_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", `${today}T00:00:00.000Z`)
    .lt("created_at", `${today}T23:59:59.999Z`)

  return { usage_today: count ?? 0, daily_limit: DAILY_LIMIT }
}

export async function simplifyText(
  text: string,
  level: DifficultyLevel
): Promise<SimplifyTextResult> {
  if (!text || text.trim().length === 0) {
    return { success: false, error: "El texto no puede estar vacío." }
  }

  if (text.length > 5000) {
    return {
      success: false,
      error: "El texto no puede superar los 5000 caracteres.",
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Debes estar autenticado para usar esta función." }
  }

  const today = new Date().toISOString().slice(0, 10)
  const { count: usageToday } = await supabase
    .from("text_simplification_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", `${today}T00:00:00.000Z`)
    .lt("created_at", `${today}T23:59:59.999Z`)

  const currentUsage = usageToday ?? 0

  if (currentUsage >= DAILY_LIMIT) {
    return {
      success: false,
      error: `Alcanzaste el límite de ${DAILY_LIMIT} simplificaciones por hoy. Volvé mañana.`,
      usage_today: currentUsage,
      daily_limit: DAILY_LIMIT,
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      success: false,
      error: "La API de Anthropic no está configurada. Contactá al administrador.",
    }
  }

  const config = LEVEL_CONFIGS[level]

  const systemPrompt = `Eres un especialista en accesibilidad lectora para niños con dislexia.
Tu tarea es reescribir el texto proporcionado para alcanzar un Índice de Dificultad Lectora (IDL) dentro del rango objetivo, manteniendo el sentido y la narrativa original.
El IDL se calcula con estas 5 variables ordenadas por impacto:

Rare (peso 1.5): porcentaje de palabras con 9 o más letras. PRIORIDAD MÁXIMA. Reemplazar palabras de 9+ letras por sinónimos cortos y frecuentes. Ejemplos: "alimentación" → "comida", "temperatura" → "calor", "diferentes" → "otros", "necesitan" → "precisan" o reestructurar la oración.
OL15 (peso 1.2): porcentaje de oraciones con más de 15 palabras. Dividir oraciones largas en dos o más oraciones cortas y claras.
LMO (peso 1.0): promedio de palabras por oración. Mantener oraciones de ${config.sentence_range} palabras.
LMP (peso 1.0): promedio de letras por palabra. Preferir palabras cortas. ${config.word_length_guide}
PL7-8 (peso 1.0): porcentaje de palabras con 7-8 letras. Reemplazar cuando exista un sinónimo más corto natural.

Criterios clínicos adicionales para dislexia:

Preferir sílabas directas (consonante-vocal como LU-NA, CA-SA) sobre sílabas complejas (consonante-consonante-vocal como TRANS, BLAN).
Debe mantenerse estricto para ajustar el texto al nivel de IDL objetivo. 
Usar palabras de alta frecuencia en español.
No devolver los resultados que hizo la IA, sino el texto final simplificado.
Preferir sustantivos concretos e imaginables (nieve, río, casa, perro) sobre abstractos.
NO inventar información ni agregar contenido nuevo.
NO cambiar el tipo de texto: si es narrativo mantener narrativo, si es informativo mantener informativo.
El texto resultante debe sonar natural y coherente, no telegráfico ni robótico.
Mantener los nombres propios sin modificar.`

  const userPrompt = `Nivel objetivo: ${config.label}\n\nTexto a simplificar:\n${text}`

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    })

    const textBlock = response.content.find((b) => b.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      return { success: false, error: "La API no devolvió un texto válido." }
    }

    await supabase.from("text_simplification_logs").insert({ user_id: user.id })

    return {
      success: true,
      simplified_text: textBlock.text,
      usage_today: currentUsage + 1,
      daily_limit: DAILY_LIMIT,
    }
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return { success: false, error: "La clave de API de Anthropic es inválida." }
    }
    if (error instanceof Anthropic.RateLimitError) {
      return {
        success: false,
        error: "Límite de uso alcanzado. Intentá de nuevo en unos minutos.",
      }
    }
    if (error instanceof Anthropic.APIError) {
      return {
        success: false,
        error: `Error de la API (${error.status}): ${error.message}`,
      }
    }
    return { success: false, error: "Ocurrió un error inesperado al simplificar el texto." }
  }
}
