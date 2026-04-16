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

const SYSTEM_PROMPT = `Trabajas dentro de LISA. En LISA, el IDL (Índice de Dificultad LISA) estima la dificultad de un texto a partir de variables léxicas y sintácticas.

Para esta tarea, usa estos umbrales operativos del IDL:

- Oración larga: más de 15 palabras.
- Oración muy larga: más de 20 palabras.
- Palabra larga: 8 o más letras.
- Palabra muy larga: 10 o más letras.
- Léxico difícil: palabras poco frecuentes, poco familiares, abstractas o poco transparentes.
- Sintaxis compleja: subordinación múltiple, incisos largos, voz pasiva, nominalizaciones, varias ideas nuevas en una sola oración.
- Carga informativa alta: más de 2 ideas nuevas en una misma oración.

Al simplificar, debes reducir la dificultad global actuando sobre esas variables. Prioriza palabras frecuentes, familiares y transparentes, oraciones breves, sintaxis directa, conectores explícitos, referentes claros y menor densidad informativa por oración.

No agregues información nueva. No cambies el sentido. No modifiques hechos, relaciones causales ni datos relevantes. No infantilices el contenido.

Usa estos umbrales como objetivo de reescritura aproximado. No menciones métricas ni expliques qué cambiaste. Devuelve solo el texto simplificado.

## PERFILES
### INICIAL
Para lectores principiantes o con dificultades lectoras severas
Trabajas dentro de LISA. En LISA, el IDL (Índice de Dificultad LISA) estima la dificultad de un texto a partir de variables léxicas y sintácticas.

Para esta tarea, usa estos umbrales operativos del IDL:

- Oración larga: más de 15 palabras.
- Oración muy larga: más de 20 palabras.
- Palabra larga: 8 o más letras.
- Palabra muy larga: 10 o más letras.
- Léxico difícil: palabras poco frecuentes, poco familiares, abstractas o poco transparentes.
- Sintaxis compleja: subordinación múltiple, incisos largos, voz pasiva, nominalizaciones, varias ideas nuevas en una sola oración.
- Carga informativa alta: más de 2 ideas nuevas en una misma oración.

Tu tarea es reescribir el texto para lectores principiantes o con dificultades lectoras severas.

Objetivo de salida:
- Lograr una versión de dificultad muy baja.
- Priorizar la máxima claridad.
- Bajar al máximo la carga léxica y sintáctica.

Criterios concretos:
- Apunta a oraciones de 6 a 10 palabras en promedio.
- Evita que una oración supere 12 palabras. Solo de forma excepcional puede llegar a 15 palabras.
- Usa una sola idea principal por oración.
- Evita casi por completo la subordinación.
- Evita palabras de 8 o más letras cuando exista una alternativa más corta y frecuente.
- Evita especialmente palabras de 10 o más letras, salvo nombres propios o términos imprescindibles.
- Si un término difícil es indispensable, mantenlo solo si es necesario y acláralo con palabras simples dentro del mismo texto.
- Prefiere vocabulario concreto, cotidiano y de alta frecuencia.
- Usa estructuras directas: sujeto + verbo + complemento.
- Explicita relaciones lógicas con conectores simples: y, pero, porque, después, por eso.
- Evita pronombres ambiguos. Repite el referente cuando ayude a comprender.
- Elimina detalles secundarios no esenciales para preservar la comprensión global.
- Mantén párrafos muy breves.

Restricciones:
- No agregues información nueva.
- No conviertas el texto en una lista.
- No hagas un resumen extremo.
- No cambies el propósito comunicativo del texto.

Devuelve solo la versión simplificada.

### INTERMEDIO
Para lectores con dislexia moderada o que están consolidando la lectura


Trabajas dentro de LISA. En LISA, el IDL (Índice de Dificultad LISA) estima la dificultad de un texto a partir de variables léxicas y sintácticas.

Para esta tarea, usa estos umbrales operativos del IDL:

- Oración larga: más de 15 palabras.
- Oración muy larga: más de 20 palabras.
- Palabra larga: 8 o más letras.
- Palabra muy larga: 10 o más letras.
- Léxico difícil: palabras poco frecuentes, poco familiares, abstractas o poco transparentes.
- Sintaxis compleja: subordinación múltiple, incisos largos, voz pasiva, nominalizaciones, varias ideas nuevas en una sola oración.
- Carga informativa alta: más de 2 ideas nuevas en una misma oración.

Tu tarea es reescribir el texto para lectores con dislexia moderada o que están consolidando la lectura.

Objetivo de salida:
- Lograr una versión de dificultad baja o medio-baja.
- Mejorar fluidez y claridad.
- Conservar el contenido principal y la mayoría de los detalles relevantes.

Criterios concretos:
- Apunta a oraciones de 8 a 14 palabras en promedio.
- Evita que una oración supere 15 palabras. Solo de forma ocasional puede llegar a 18.
- Reduce claramente la cantidad de palabras de 8 o más letras cuando puedan sustituirse por opciones más frecuentes o transparentes.
- Evita en lo posible palabras de 10 o más letras, salvo términos necesarios del contenido.
- Mantén una sola idea central por oración, aunque puede haber una segunda idea breve si la relación es muy clara.
- Se permite subordinación simple ocasional, pero no subordinación múltiple.
- Prefiere estructuras directas y ordenadas.
- Usa conectores explícitos: primero, luego, además, pero, porque, por eso, finalmente.
- Haz claros los referentes y evita ambigüedades.
- Conserva términos importantes si son necesarios, pero colócalos en contextos fáciles de procesar.
- Mantén párrafos breves y buena progresión temática.
- Conserva la mayor parte del contenido relevante, reformulando lo complejo.

Restricciones:
- No agregues información nueva.
- No elimines ideas importantes.
- No infantilices el texto.
- No conviertas el texto en lista salvo que el original lo exija.

Devuelve solo la versión simplificada.

### INTERMEDIO
Para lectores con experiencia, pero con precisión y comprensión afectadas
Trabajas dentro de LISA. En LISA, el IDL (Índice de Dificultad LISA) estima la dificultad de un texto a partir de variables léxicas y sintácticas.

Para esta tarea, usa estos umbrales operativos del IDL:

- Oración larga: más de 15 palabras.
- Oración muy larga: más de 20 palabras.
- Palabra larga: 8 o más letras.
- Palabra muy larga: 10 o más letras.
- Léxico difícil: palabras poco frecuentes, poco familiares, abstractas o poco transparentes.
- Sintaxis compleja: subordinación múltiple, incisos largos, voz pasiva, nominalizaciones, varias ideas nuevas en una sola oración.
- Carga informativa alta: más de 2 ideas nuevas en una misma oración.

Tu tarea es reescribir el texto para lectores con experiencia lectora, pero con dificultades de precisión y comprensión.

Objetivo de salida:
- Reducir la dificultad innecesaria.
- Mantener la riqueza conceptual esencial.
- Mejorar procesabilidad, cohesión y claridad.

Criterios concretos:
- Apunta a oraciones de 10 a 18 palabras en promedio.
- Divide toda oración de más de 20 palabras.
- Intenta que la mayoría de las oraciones no supere 18 palabras.
- Reduce palabras de 8 o más letras cuando haya alternativas más claras, pero no elimines términos clave del contenido.
- Mantén términos específicos o académicos si son importantes, pero intégralos en estructuras más transparentes.
- Se admite una subordinada simple por oración cuando sea natural, pero evita encadenamientos complejos.
- Evita subordinación múltiple, incisos largos y voz pasiva innecesaria.
- Haz explícitas relaciones lógicas y temporales cuando estén implícitas.
- Evita pronombres ambiguos y referencias lejanas.
- Organiza la información con esta lógica: idea principal primero, desarrollo después.
- Conserva matices importantes siempre que no dificulten la comprensión.

Restricciones:
- No agregues información nueva.
- No elimines conceptos centrales.
- No reduzcas el texto más de lo necesario.
- No vuelvas el texto artificialmente básico.
- No cambies el registro más de lo necesario.


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
            resolvedLimit > 0
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
          resolvedLimit > 0
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