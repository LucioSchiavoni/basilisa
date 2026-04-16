"use server"

import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type Question = {
  question: string
  options: string[]
  correct_index: number
}

export type GenerateQuestionsResult =
  | { success: true; questions: Question[]; usage_today: number; daily_limit: number }
  | { success: false; error: string; usage_today?: number; daily_limit?: number }

const FREE_DAILY_LIMIT = 20
const ADMIN_DAILY_LIMIT = 1000
const QUESTION_GEN_FEATURE_KEY = "question_generation"
const DAILY_PERIOD = "daily"

const SYSTEM_PROMPT = `Sos un especialista en comprensión lectora para niños con dislexia.
Tu tarea es generar preguntas de opción múltiple sobre un texto dado.

Reglas estrictas:
- Cada pregunta tiene exactamente 4 opciones (A, B, C, D)
- Solo una opción es correcta
- Las opciones incorrectas deben ser plausibles pero claramente incorrectas al leer el texto
- Las preguntas evalúan comprensión real, no memoria fotográfica
- Nunca uses negaciones en las preguntas ("¿Cuál NO es...?")

Adaptación por nivel:

INICIAL:
- Preguntas sobre hechos explícitos y directos del texto
- Vocabulario muy simple en preguntas y opciones
- Oraciones cortas, máximo 10 palabras por pregunta
- Opciones de 2 a 5 palabras cada una
- Ejemplo: "¿Dónde vive el personaje?" / "En el bosque" / "En el mar" / "En la ciudad" / "En el desierto"

INTERMEDIO:
- Mezcla de hechos explícitos y comprensión básica
- Vocabulario moderado, oraciones de hasta 15 palabras
- Algunas preguntas sobre causa y efecto simples
- Opciones de 3 a 8 palabras cada una

AVANZADO:
- Inferencias, causa-efecto, idea principal
- Vocabulario más rico
- Preguntas que requieren relacionar información del texto
- Opciones de 4 a 12 palabras cada una

Respondé ÚNICAMENTE con JSON válido, sin texto adicional, sin markdown:
{
  "questions": [
    {
      "question": "texto de la pregunta",
      "options": ["opción A", "opción B", "opción C", "opción D"],
      "correct_index": 0
    }
  ]
}`

async function getDailyLimit(userId: string, role: string): Promise<number> {
  if (role === "admin") return ADMIN_DAILY_LIMIT
  const supabase = await createClient()
  const { data: resolvedLimit } = await supabase.rpc("get_user_feature_limit", {
    p_user_id: userId,
    p_feature_key: QUESTION_GEN_FEATURE_KEY,
    p_period: DAILY_PERIOD,
  })
  if (typeof resolvedLimit === "number" && Number.isFinite(resolvedLimit) && resolvedLimit > 0) {
    return resolvedLimit
  }
  return FREE_DAILY_LIMIT
}

export async function getQuestionGenerationUsage(): Promise<{
  usage_today: number
  daily_limit: number
}> {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { usage_today: 0, daily_limit: FREE_DAILY_LIMIT }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const dailyLimit = await getDailyLimit(user.id, profile?.role ?? "patient")
  const today = new Date().toISOString().slice(0, 10)
  const { count } = await adminClient
    .from("question_generation_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", `${today}T00:00:00.000Z`)
    .lt("created_at", `${today}T23:59:59.999Z`)

  return { usage_today: count ?? 0, daily_limit: dailyLimit }
}

export async function generateQuestions(
  sourceText: string,
  level: "inicial" | "intermedio" | "avanzado",
  count: number
): Promise<GenerateQuestionsResult> {
  if (sourceText.trim().length < 30) {
    return { success: false, error: "El texto es demasiado corto" }
  }
  if (count < 1 || count > 10) {
    return { success: false, error: "La cantidad debe ser entre 1 y 10" }
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return { success: false, error: "API key no configurada" }
  }

  const supabase = await createClient()
  const adminClient = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Debes estar autenticado para usar esta función." }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const dailyLimit = await getDailyLimit(user.id, profile?.role ?? "patient")
  const today = new Date().toISOString().slice(0, 10)

  const { count: usageToday } = await adminClient
    .from("question_generation_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", `${today}T00:00:00.000Z`)
    .lt("created_at", `${today}T23:59:59.999Z`)

  const currentUsage = usageToday ?? 0

  if (currentUsage >= dailyLimit) {
    return {
      success: false,
      error: "limit_reached",
      usage_today: currentUsage,
      daily_limit: dailyLimit,
    }
  }

  try {
    const client = new Anthropic()
    const data = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Nivel: ${level.toUpperCase()}
Cantidad de preguntas: ${count}

Texto:
${sourceText.trim()}`,
        },
      ],
    })

    const raw = data.content[0].type === "text" ? data.content[0].text : ""
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim()
    const parsed = JSON.parse(cleaned)

    if (
      !parsed.questions ||
      !Array.isArray(parsed.questions) ||
      parsed.questions.length < 1
    ) {
      return { success: false, error: "Respuesta inválida del modelo" }
    }

    for (const q of parsed.questions) {
      if (
        typeof q.question !== "string" ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        q.options.some((o: unknown) => typeof o !== "string") ||
        typeof q.correct_index !== "number" ||
        q.correct_index < 0 ||
        q.correct_index > 3
      ) {
        return { success: false, error: "Respuesta inválida del modelo" }
      }
    }

    await adminClient.from("question_generation_logs").insert({ user_id: user.id })

    const { count: updatedUsage } = await adminClient
      .from("question_generation_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00.000Z`)
      .lt("created_at", `${today}T23:59:59.999Z`)

    return {
      success: true,
      questions: parsed.questions,
      usage_today: updatedUsage ?? currentUsage + 1,
      daily_limit: dailyLimit,
    }
  } catch {
    return { success: false, error: "Error al generar preguntas" }
  }
}
