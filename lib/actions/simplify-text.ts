"use server"

import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { analyzeText } from "@/lib/services/idl"
import type { StructuralMetrics, LexicalMetrics } from "@/lib/services/idl"

type DifficultyLevel = "inicial" | "intermedio" | "avanzado"

export type GlossaryEntry = {
  term: string
  definition: string
}

export type SimplifyResult =
  | {
      success: true
      simplified_text: string
      idl_score: number
      metrics: { structural: StructuralMetrics; lexical: LexicalMetrics }
      glossary: GlossaryEntry[]
      usage_today?: number
      daily_limit?: number
    }
  | {
      success: false
      error: string
      usage_today?: number
      daily_limit?: number
    }

const DEFAULT_DAILY_LIMIT = 5
const ADMIN_DAILY_LIMIT = 100
const SIMPLIFIER_FEATURE_KEY = "text_simplifier"
const DAILY_PERIOD = "daily"

const TARGET_RANGES = {
  inicial: { label: "Inicial" },
  intermedio: { label: "Intermedio" },
  avanzado: { label: "Avanzado" },
}

const SYSTEM_PROMPT = `Eres un simplificador de textos para niños con dislexia. Tu tarea es reescribir textos para que un niño con dificultades lectoras pueda entenderlos.

## PRIORIDAD ABSOLUTA
La comprensión del niño es el único objetivo. La narratividad, el estilo y la fidelidad al texto original son secundarios. Si hay conflicto entre simplicidad y estilo, siempre gana la simplicidad. Sacrificar elegancia es correcto. Sacrificar la comprensión es inaceptable. Un texto que suena raro pero se entiende es mejor que un texto que suena bien pero el niño no puede leer.

## PERFILES
### INICIAL
Para lectores en etapa temprana con dislexia severa.
Sintaxis:
- Oraciones de 5 a 8 palabras. Ninguna supera 10 palabras.
- Orden preferido: sujeto → verbo → objeto. Sin subordinaciones complejas.
- Dos ideas cortas relacionadas pueden unirse con: que, y, pero, porque, entonces.
Vocabulario:
- Palabras de 1 a 5 letras preferentemente. Evitar palabras de más de 7 letras.
- Solo vocabulario que un niño de 6 a 8 años usa o escucha a diario.
- Sustantivos concretos e imaginables (casa, perro, río) sobre abstractos (proceso, concepto, situación).
- Si una palabra técnica es inevitable, mantenerla e incluirla en el glosario.
Estilo:
- Conectores simples: porque, entonces, pero, también, y, que, aunque, cuando.
- El texto puede sonar básico. Eso está bien. Lo importante es que el niño entienda.

### INTERMEDIO
Para lectores con dislexia moderada que ya tienen cierta fluidez.
Sintaxis:
- Oraciones de 8 a 12 palabras. Ninguna supera 15 palabras.
- Minimizar subordinaciones. Preferir coordinación con conectores claros.
Vocabulario:
- Evitar palabras de más de 8 letras salvo términos irremplazables.
- Vocabulario frecuente del español. Palabras específicas se definen brevemente en la misma oración.
- Sustantivos concretos siempre que sea posible.
Estilo:
- Conectores: porque, además, por ejemplo, entonces, pero, también, sin embargo.

### AVANZADO
Para lectores con dislexia leve o en etapa de consolidación.
Sintaxis:
- Oraciones de hasta 15 palabras en promedio.
- Simplificar solo lo que dificulte la lectura fluida.
Vocabulario:
- Vocabulario cercano al original.
- Simplificar solo palabras infrecuentes o de pronunciación compleja.
Estilo:
- Simplificar lo que dificulte la lectura. El estilo puede cambiar si es necesario para la comprensión.

## REGLAS UNIVERSALES

Contenido:
- El objetivo es que el niño entienda la idea principal del texto. Si para lograrlo el texto queda muy diferente al original en estructura y estilo, eso es correcto.
- Preservar las ideas centrales del texto. Detalles secundarios, aclaraciones y redundancias pueden eliminarse si dificultan la lectura.
- Mantener nombres propios sin modificar.
- Prohibido agregar información, datos o adjetivos que no estén en el texto original.
- Prohibido repetir o explicar lo que la oración anterior ya dijo.

Vocabulario:
- Reemplazar siempre palabras largas o formales por equivalentes simples: utilizar→usar, poseer→tener, realizar→hacer, alimentación→comida, temperatura→calor, constituye→es, acumuladas→guardadas, trayecto→viaje, recorren→viajan, dependen→usan, especialmente→muy, vulnerables→en peligro.
- No inventar descripciones para términos técnicos irremplazables. Si el original dice "mamíferos", no escribir "bichos con pelo". Mantener el término y agregarlo al glosario.
- Prohibido repetir el mismo sustantivo o adjetivo en oraciones consecutivas.

Sintaxis:
- Oraciones largas se dividen en oraciones cortas independientes, cada una con sujeto y verbo propios.
- Nunca usar comas para reemplazar un verbo omitido.
- Preferir siempre: sujeto → verbo → objeto.

Estilo:
- Usar conectores para guiar al lector: porque, además, por eso, entonces, pero, también, sin embargo, cuando.

## GLOSARIO
Identificá entre 3 y 5 palabras del texto simplificado que puedan ser difíciles para un niño del perfil indicado. Para el perfil Inicial, cualquier palabra de más de 6 letras o de uso poco frecuente en niños de 6 a 8 años es candidata. Para Intermedio, palabras de más de 8 letras o vocabulario especializado. Para Avanzado, solo términos técnicos o muy infrecuentes. Siempre incluí al menos 3 términos salvo que el texto sea extremadamente simple.
Para cada término escribí una definición que explique qué es realmente, con contexto suficiente para entender su significado en el texto. Clara y directa, en vocabulario simple, pero no superficial.

## FORMATO DE RESPUESTA
JSON puro, sin markdown, sin backticks:
{"simplified_text": "texto aquí", "glossary": [{"term": "término", "definition": "definición"}]}`

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function callClaudeWithRetry(
  client: Anthropic,
  params: Anthropic.MessageCreateParamsNonStreaming,
  maxRetries = 2
): Promise<Anthropic.Message> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await client.messages.create(params)
    } catch (err) {
      const isRetryable =
        err instanceof Anthropic.APIError &&
        (err.status === 429 || err.status === 529 || err.status >= 500)

      if (!isRetryable || attempt === maxRetries) throw err
      await sleep(1000 * Math.pow(2, attempt))
    }
  }
  throw new Error("Max retries exceeded")
}

export async function getSimplificationUsage(): Promise<{
  usage_today: number
  daily_limit: number
}> {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { usage_today: 0, daily_limit: DEFAULT_DAILY_LIMIT }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const dailyLimit =
    profile?.role === "admin"
      ? ADMIN_DAILY_LIMIT
      : await (async () => {
          const { data: resolvedLimit } = await supabase.rpc("get_user_feature_limit", {
            p_user_id: user.id,
            p_feature_key: SIMPLIFIER_FEATURE_KEY,
            p_period: DAILY_PERIOD,
          })

          return typeof resolvedLimit === "number" &&
            Number.isFinite(resolvedLimit) &&
            resolvedLimit >= 0
            ? resolvedLimit
            : DEFAULT_DAILY_LIMIT
        })()

  const today = new Date().toISOString().slice(0, 10)
  const { count } = await adminClient
    .from("text_simplification_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", `${today}T00:00:00.000Z`)
    .lt("created_at", `${today}T23:59:59.999Z`)

  return { usage_today: count ?? 0, daily_limit: dailyLimit }
}

export async function analyzeTextForFilter(text: string): Promise<{ score: number } | null> {
  if (text.trim().length < 50) return null
  try {
    const result = await analyzeText(text)
    return result.score !== null ? { score: result.score } : null
  } catch {
    return null
  }
}

export async function simplifyText(
  text: string,
  level: DifficultyLevel,
  forceComplex?: boolean
): Promise<SimplifyResult> {
  if (!text || text.trim().length === 0) {
    return { success: false, error: "El texto no puede estar vacío." }
  }
  if (text.length > 5000) {
    return { success: false, error: "El texto no puede superar los 5000 caracteres." }
  }

  const supabase = await createClient()
  const adminClient = createAdminClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Debes estar autenticado para usar esta función." }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const today = new Date().toISOString().slice(0, 10)
  const { data: resolvedLimit } = await supabase.rpc("get_user_feature_limit", {
    p_user_id: user.id,
    p_feature_key: SIMPLIFIER_FEATURE_KEY,
    p_period: DAILY_PERIOD,
  })

  const dailyLimit =
    profile?.role === "admin"
      ? ADMIN_DAILY_LIMIT
      : typeof resolvedLimit === "number" &&
          Number.isFinite(resolvedLimit) &&
          resolvedLimit >= 0
        ? resolvedLimit
        : DEFAULT_DAILY_LIMIT

  const { count: usageToday } = await adminClient
    .from("text_simplification_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", `${today}T00:00:00.000Z`)
    .lt("created_at", `${today}T23:59:59.999Z`)

  const currentUsage = usageToday ?? 0

  if (currentUsage >= dailyLimit) {
    return {
      success: false,
      error: `Alcanzaste el límite de ${dailyLimit} simplificaciones por hoy. Volvé mañana.`,
      usage_today: currentUsage,
      daily_limit: dailyLimit,
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      success: false,
      error: "La API de Anthropic no está configurada. Contactá al administrador.",
    }
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const range = TARGET_RANGES[level]

  const userMessage = forceComplex
  ? `Perfil objetivo: ${range.label}\n\nEste texto es complejo, pero el objetivo sigue siendo que un niño con dislexia pueda entenderlo. Simplificá con agresividad aplicando el perfil ${range.label}: cortá oraciones largas, reemplazá palabras difíciles por equivalentes simples, usá vocabulario concreto y cotidiano. El texto resultante puede sonar muy diferente al original — eso está bien. Priorizá siempre la comprensión sobre la fidelidad estilística.\n\nTexto a simplificar:\n${text}`
  : `Perfil objetivo: ${range.label}\n\nSimplificá este texto para que un niño con dislexia pueda entenderlo. Aplicá el perfil ${range.label} con agresividad: cortá oraciones largas en oraciones cortas independientes, reemplazá cada palabra compleja o formal por su equivalente más simple, usá vocabulario concreto y cotidiano. El texto puede quedar muy diferente al original en estilo y estructura — eso es correcto y esperado. Lo único que debe conservarse es el contenido informativo. Un texto simple y comprensible es siempre mejor que uno elegante pero difícil.\n\nTexto a simplificar:\n${text}`

  let claudeText: string
  let parsedGlossary: GlossaryEntry[] = []

  try {
    const response = await callClaudeWithRetry(client, {
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      stream: false,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    })

    const textBlock = response.content.find((b) => b.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      return { success: false, error: "La API no devolvió un texto válido." }
    }

    let parsed: { simplified_text: string; glossary?: GlossaryEntry[] }
    try {
      parsed = JSON.parse(textBlock.text.trim()) as {
        simplified_text: string
        glossary?: GlossaryEntry[]
      }
    } catch {
      return {
        success: false,
        error: "La respuesta del modelo no pudo procesarse. Intentá de nuevo con un texto diferente.",
      }
    }

    claudeText = parsed.simplified_text
    parsedGlossary = Array.isArray(parsed.glossary) ? parsed.glossary : []
  } catch (err) {
    const isApiError = err instanceof Anthropic.APIError
    if (isApiError && err.status === 429) {
      return {
        success: false,
        error: "El servicio está temporalmente ocupado. Esperá unos segundos e intentá de nuevo.",
      }
    }
    return {
      success: false,
      error: "No se pudo conectar con el servicio de simplificación. Intentá de nuevo.",
    }
  }

  let idlResult: { structural: StructuralMetrics; lexical: LexicalMetrics; score: number | null }

  try {
    idlResult = await analyzeText(claudeText)
  } catch {
    return { success: false, error: "El microservicio IDL no está disponible." }
  }

  const { error: insertLogError } = await adminClient
    .from("text_simplification_logs")
    .insert({ user_id: user.id })

  if (insertLogError) {
    console.error("Simplification log insert error:", insertLogError)
    return { success: false, error: "No se pudo registrar el uso del simplificador." }
  }

  const { count: updatedUsage } = await adminClient
    .from("text_simplification_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", `${today}T00:00:00.000Z`)
    .lt("created_at", `${today}T23:59:59.999Z`)

  return {
    success: true,
    simplified_text: claudeText,
    idl_score: idlResult.score ?? 0,
    metrics: { structural: idlResult.structural, lexical: idlResult.lexical },
    glossary: parsedGlossary,
    usage_today: updatedUsage ?? currentUsage + 1,
    daily_limit: dailyLimit,
  }
}