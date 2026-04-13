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
      achievable: boolean
      attempts: number
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
  inicial: { min: 0, max: 30, label: "Inicial" },
  intermedio: { min: 30, max: 55, label: "Intermedio" },
  avanzado: { min: 55, max: 80, label: "Avanzado" },
}

const METRIC_TARGETS: Record<
  DifficultyLevel,
  {
    avg_words_per_sentence: number
    long_sentence_ratio: number
    avg_letters_per_word: number
    medium_word_ratio: number
    rare_word_ratio: number
  }
> = {
  inicial: {
    avg_words_per_sentence: 7,
    long_sentence_ratio: 0,
    avg_letters_per_word: 3.8,
    medium_word_ratio: 0.05,
    rare_word_ratio: 0,
  },
  intermedio: {
    avg_words_per_sentence: 10,
    long_sentence_ratio: 0,
    avg_letters_per_word: 4.5,
    medium_word_ratio: 0.1,
    rare_word_ratio: 0.03,
  },
  avanzado: {
    avg_words_per_sentence: 14,
    long_sentence_ratio: 0.15,
    avg_letters_per_word: 5.0,
    medium_word_ratio: 0.15,
    rare_word_ratio: 0.08,
  },
}

const SYSTEM_PROMPT = `Eres un simplificador de textos para niños con dislexia. Tu tarea es reescribir textos adaptando el vocabulario, la sintaxis y el estilo al perfil indicado. Preservá todas las ideas centrales del texto original. Podés reformular libremente — el contenido debe mantenerse, la forma puede cambiar de manera considerable. Un texto más simple y fluido siempre es preferible a uno que conserva la complejidad original.

## PERFILES

### INICIAL
Para lectores en etapa temprana con dislexia severa.

Sintaxis:
- Oraciones de 5 a 8 palabras. Ninguna supera 10 palabras.
- Orden estricto: sujeto → verbo → objeto. Sin variaciones, sin subordinaciones.
- Una idea por oración. Siempre.

Vocabulario:
- Palabras de 1 a 5 letras preferentemente. Evitar palabras de más de 7 letras.
- Solo vocabulario que un niño de 6 a 8 años usa o escucha a diario.
- Primera sílaba de estructura simple: consonante+vocal (CA, LU, PE) o consonante+vocal+consonante (CAR, LUN, PER).
- Palabras donde grafemas y fonemas se corresponden uno a uno siempre que sea posible.
- Sustantivos concretos e imaginables (casa, perro, río) sobre abstractos (proceso, concepto, situación).

Estilo:
- La fluidez narrativa la dan los conectores, no la estructura de la oración.
- Conectores simples: porque, entonces, pero, también, y.
- El texto debe sonar natural. Nunca telegráfico.

### INTERMEDIO
Para lectores con dislexia moderada que ya tienen cierta fluidez.

Sintaxis:
- Oraciones de 8 a 12 palabras. Ninguna supera 15 palabras.
- Minimizar subordinaciones. Preferir coordinación con conectores claros.

Vocabulario:
- Evitar palabras de más de 8 letras salvo términos irremplazables.
- Vocabulario frecuente del español. Las palabras específicas se definen brevemente en la misma oración.
- Sustantivos concretos siempre que sea posible.

Estilo:
- Conectores que favorezcan la comprensión: porque, además, por ejemplo, entonces, pero, también, sin embargo.
- Estilo narrativo o descriptivo claro.
- El texto debe sonar fluido y bien escrito.

### AVANZADO
Para lectores con dislexia leve o en etapa de consolidación.

Sintaxis:
- Oraciones de hasta 15 palabras en promedio.
- Estructura cercana al original. Simplificar solo lo que dificulte la lectura fluida.

Vocabulario:
- Vocabulario cercano al original.
- Simplificar solo palabras infrecuentes o de pronunciación compleja.
- Se permiten palabras largas si son frecuentes o el niño las conoce por contexto.

Estilo:
- Preservar el estilo y la voz del texto fuente.
- Conectores para asegurar fluidez narrativa donde haga falta.

## REGLAS UNIVERSALES

Contenido:
- Preservar todas las ideas centrales del texto original.
- Mantener nombres propios sin modificar.
- En textos informativos, eliminar solo información redundante o ambigua, nunca información relevante.
- Simplificá activamente todas las oraciones, incluso las que parezcan simples. Una oración puede mantenerse igual solo si ya cumple los criterios de longitud y vocabulario del perfil objetivo.

Vocabulario:
- Prohibido repetir el mismo adjetivo o sustantivo en la misma oración o en oraciones consecutivas del mismo párrafo. Si la idea lo requiere, usar un sinónimo o reestructurar la oración.
- Preferir palabras con sílabas simples (consonante+vocal) sobre grupos consonánticos complejos (trans-, blan-, pren-, -str-).
- Sustituir palabras largas por equivalentes cortos cuando existan: utilizar→usar, poseer→tener, realizar→hacer, alimentación→comida, temperatura→calor, diferentes→otros, también→y, algunos→unos, momento→rato, constituye→es, especialmente→muy, acumuladas→guardadas, dependiendo→usando.

Sintaxis:
- Nunca usar comas para reemplazar un verbo omitido.
- Oraciones largas se dividen en oraciones completas independientes, cada una con sujeto y verbo propios. El límite por perfil es el que define cuándo una oración es demasiado larga.

Estilo:
- El texto simplificado debe sonar escrito por un autor cuidadoso, no como una lista de frases cortas.
- Usar conectores para guiar al lector: porque, además, por eso, entonces, por ejemplo, pero, también, sin embargo.
- Preferir estilo narrativo incluso en textos informativos.

## GLOSARIO

Identifica las palabras del texto simplificado que puedan resultar difíciles de comprender para un niño del perfil indicado. Selecciona un máximo de 5 términos, priorizando los más complejos o infrecuentes. Para cada término escribe una definición breve, en lenguaje simple, apropiada para el perfil.

No incluyas en el glosario palabras que ya sean simples o cotidianas para el perfil. Si no hay términos que lo justifiquen, devuelve un array vacío.

## FORMATO DE RESPUESTA

JSON puro, sin markdown, sin backticks:
{"simplified_text": "texto aquí", "glossary": [{"term": "término", "definition": "definición breve en lenguaje simple"}]}`

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

function distanceToRange(score: number, level: DifficultyLevel): number {
  const { min, max } = TARGET_RANGES[level]
  if (score < min) return min - score
  if (score > max) return score - max
  return 0
}

function buildFeedback(
  structural: StructuralMetrics,
  lexical: LexicalMetrics,
  score: number,
  level: DifficultyLevel
): string {
  const targets = METRIC_TARGETS[level]
  const range = TARGET_RANGES[level]

  const variables = [
    {
      label: "Rare (% palabras 9+ letras)",
      value: structural.rare_word_ratio,
      target: targets.rare_word_ratio,
      weight: 1.5,
      isRatio: true,
      action:
        "Reemplazá cada palabra de 9 o más letras por un sinónimo más corto. Si no existe sinónimo, mantené el término y agregalo al glosario.",
    },
    {
      label: "OL15 (% oraciones >15 palabras)",
      value: structural.long_sentence_ratio,
      target: targets.long_sentence_ratio,
      weight: 1.2,
      isRatio: true,
      action:
        "Dividí cada oración larga en dos oraciones más cortas, cada una con sujeto y verbo propios. No uses coma para separar — usá punto y comenzá una nueva oración.",
    },
    {
      label: "LMO (palabras/oración)",
      value: structural.avg_words_per_sentence,
      target: targets.avg_words_per_sentence,
      weight: 1.0,
      isRatio: false,
      action:
        "Cortá las oraciones más largas en dos. Cada oración debe tener sujeto y verbo propios.",
    },
    {
      label: "LMP (letras/palabra)",
      value: structural.avg_letters_per_word,
      target: targets.avg_letters_per_word,
      weight: 1.0,
      isRatio: false,
      action:
        "Reemplazá palabras largas por equivalentes más cortos: utilizar→usar, realizar→hacer, alimentación→comida, temperatura→calor, diferentes→otros.",
    },
    {
      label: "PL78 (% palabras 7-8 letras)",
      value: structural.medium_word_ratio,
      target: targets.medium_word_ratio,
      weight: 1.0,
      isRatio: true,
      action:
        "Buscá palabras de 7 u 8 letras que tengan sinónimos más cortos y reemplazalas. Si no hay sinónimo disponible, mantené la palabra.",
    },
  ]

  const exceeding = variables
    .filter((v) => v.value > v.target)
    .map((v) => ({ ...v, impact: (v.value - v.target) * v.weight }))
    .sort((a, b) => b.impact - a.impact)

  const fmt = (v: (typeof exceeding)[0]) =>
    v.isRatio ? `${(v.value * 100).toFixed(1)}%` : v.value.toFixed(1)
  const fmtTarget = (v: (typeof exceeding)[0]) =>
    v.isRatio ? `≤${(v.target * 100).toFixed(0)}%` : `≤${v.target}`

  const exceedingList =
    exceeding.length > 0
      ? exceeding
          .map(
            (v, i) =>
              `${i + 1}. ${v.label}: ${fmt(v)} (objetivo: ${fmtTarget(v)})\n   → Qué hacer: ${v.action}`
          )
          .join("\n\n")
      : "Todas las variables están dentro del objetivo."

return `Tu simplificación anterior no alcanzó el IDL objetivo. Necesitás simplificar más.

Perfil objetivo: ${range.label} (IDL ${range.min}–${range.max})
IDL obtenido: ${score.toFixed(1)} — ${score > range.max ? "el texto sigue siendo demasiado complejo" : "el texto quedó demasiado simple"}

Métricas estructurales:
- Palabras por oración (promedio): ${structural.avg_words_per_sentence.toFixed(1)}
- Oraciones de más de 15 palabras: ${(structural.long_sentence_ratio * 100).toFixed(1)}%
- Letras por palabra (promedio): ${structural.avg_letters_per_word.toFixed(2)}
- Palabras de 7 a 8 letras: ${(structural.medium_word_ratio * 100).toFixed(1)}%
- Palabras de 9 o más letras: ${(structural.rare_word_ratio * 100).toFixed(1)}%

Métricas léxicas:
- Frecuencia promedio: ${lexical.avg_frequency.toFixed(2)} / 10 (objetivo: mayor a 6)
- Imaginabilidad promedio: ${lexical.avg_imageability.toFixed(2)} / 7 (objetivo: mayor a 4)
- Palabras fuera de la base léxica: ${(lexical.unknown_word_ratio * 100).toFixed(1)}%

Correcciones requeridas ordenadas por impacto:
${exceedingList}

Reescribí el texto desde cero aplicando esas correcciones de forma agresiva. No hagas ajustes menores sobre la versión anterior — reescribí completamente con el perfil ${range.label} en mente. Priorizá la simplificación sobre la fidelidad estilística. El contenido central debe preservarse, la forma puede cambiar considerablemente.

Respondé solo con JSON: {"simplified_text": "texto corregido aquí", "glossary": [{"term": "término", "definition": "definición"}]}`
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

  type Attempt = {
    simplified_text: string
    idl_score: number
    metrics: { structural: StructuralMetrics; lexical: LexicalMetrics }
    distance: number
  }

  let bestAttempt: Attempt | null = null
  let parsedGlossary: GlossaryEntry[] = []
  const conversationHistory: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: forceComplex
        ? `Este texto tiene vocabulario complejo. Hacé una simplificación mínima de legibilidad:\n\n- Dividí oraciones muy largas en oraciones más cortas\n- Reemplazá palabras muy difíciles o técnicas por equivalentes más simples cuando existan sin perder el significado\n- Mantené todo el contenido original sin excepción\n- No fuerces ningún nivel de simplicidad — el texto puede seguir siendo difícil\n- El objetivo es que sea levemente más fácil de leer, no transformarlo\n\nTexto:\n${text}`
        : `Nivel objetivo: ${range.label}\n\nSi el texto contiene vocabulario técnico o abstracto que no puede simplificarse sin perder el sentido, simplifica todo lo que sea posible y mantén los términos irremplazables tal cual. Es preferible un texto fiel con algunas palabras difíciles que un texto distorsionado.\n\nTexto a simplificar:\n${text}`,
    },
  ]

  const maxAttempts = forceComplex ? 1 : 3
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let claudeText: string

    try {
      const response = await callClaudeWithRetry(client, {
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        stream: false,
        system: SYSTEM_PROMPT,
        messages: conversationHistory,
      })

      const textBlock = response.content.find((b) => b.type === "text")
      if (!textBlock || textBlock.type !== "text") {
        return { success: false, error: "La API no devolvió un texto válido." }
      }

      conversationHistory.push({ role: "assistant", content: textBlock.text })

      let parsed: { simplified_text: string; glossary?: GlossaryEntry[] }
      try {
        parsed = JSON.parse(textBlock.text.trim()) as {
          simplified_text: string
          glossary?: GlossaryEntry[]
        }
      } catch {
        return {
          success: false,
          error:
            "La respuesta del modelo no pudo procesarse. Intentá de nuevo con un texto diferente.",
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
      console.error("Claude API error:", err)
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

    const score = idlResult.score ?? 50
    const distance = distanceToRange(score, level)

    const thisAttempt: Attempt = {
      simplified_text: claudeText,
      idl_score: score,
      metrics: { structural: idlResult.structural, lexical: idlResult.lexical },
      distance,
    }

    if (bestAttempt === null || distance < bestAttempt.distance) {
      bestAttempt = thisAttempt
    }

    if (distance === 0) {
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
        idl_score: score,
        achievable: true,
        attempts: attempt,
        metrics: { structural: idlResult.structural, lexical: idlResult.lexical },
        glossary: parsedGlossary,
        usage_today: updatedUsage ?? currentUsage + 1,
        daily_limit: dailyLimit,
      }
    }

    if (attempt < maxAttempts) {
      const feedback = buildFeedback(idlResult.structural, idlResult.lexical, score, level)
      conversationHistory.push({ role: "user", content: feedback })
    }
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
    simplified_text: bestAttempt!.simplified_text,
    idl_score: bestAttempt!.idl_score,
    achievable: false,
    attempts: maxAttempts,
    metrics: bestAttempt!.metrics,
    glossary: parsedGlossary,
    usage_today: updatedUsage ?? currentUsage + 1,
    daily_limit: dailyLimit,
  }
}