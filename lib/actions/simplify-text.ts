"use server"

import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"
import { analyzeText } from "@/lib/services/idl"
import type { StructuralMetrics, LexicalMetrics } from "@/lib/services/idl"

type DifficultyLevel = "muy_facil" | "facil" | "medio" | "dificil"

export type SimplifyResult =
  | {
      success: true
      simplified_text: string
      idl_score: number
      achievable: boolean
      attempts: number
      metrics: { structural: StructuralMetrics; lexical: LexicalMetrics }
      usage_today?: number
      daily_limit?: number
    }
  | {
      success: false
      error: string
      usage_today?: number
      daily_limit?: number
    }

const DAILY_LIMIT = 5

const TARGET_RANGES = {
  muy_facil: { min: 0, max: 20, label: "Muy fácil" },
  facil: { min: 20, max: 40, label: "Fácil" },
  medio: { min: 40, max: 60, label: "Medio" },
  dificil: { min: 60, max: 80, label: "Difícil" },
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
  muy_facil: { avg_words_per_sentence: 6, long_sentence_ratio: 0, avg_letters_per_word: 3.8, medium_word_ratio: 0.05, rare_word_ratio: 0 },
  facil: { avg_words_per_sentence: 9, long_sentence_ratio: 0, avg_letters_per_word: 4.5, medium_word_ratio: 0.10, rare_word_ratio: 0.03 },
  medio: { avg_words_per_sentence: 12, long_sentence_ratio: 0.20, avg_letters_per_word: 5.0, medium_word_ratio: 0.15, rare_word_ratio: 0.08 },
  dificil: { avg_words_per_sentence: 18, long_sentence_ratio: 0.50, avg_letters_per_word: 5.5, medium_word_ratio: 0.20, rare_word_ratio: 0.12 },
}

const SYSTEM_PROMPT = `Eres un motor de simplificación lectora clínica para niños con dislexia.
Reescribes textos en español para alcanzar un IDL objetivo específico.

## FÓRMULA IDL

IDL = 100 × min(1, suma_ponderada / 3.6)

suma_ponderada = (1.0 × LMO_n) + (1.2 × OL15_n) + (1.0 × LMP_n) + (1.0 × PL78_n) + (1.5 × Rare_n)

Variables normalizadas (0.0 a 1.0):
- LMO_n = promedio_palabras_por_oración / 20
- OL15_n = proporción_oraciones_con_más_de_15_palabras
- LMP_n = promedio_letras_por_palabra / 8
- PL78_n = proporción_palabras_con_7_u_8_letras
- Rare_n = proporción_palabras_con_9_o_más_letras

"Letras" = caracteres alfabéticos (a-z, á,é,í,ó,ú,ü,ñ). No contar números, signos, guiones.
"Palabras" = tokens separados por espacios, excluyendo tokens de solo puntuación o números.
"Oraciones" = segmentos terminados en punto, signo de interrogación o exclamación.

## TARGETS POR NIVEL

### IDL 0-20 (Muy fácil)
- Oraciones de 5-7 palabras en promedio, NINGUNA mayor a 15
- Promedio de letras por palabra ≤ 3.8
- CERO palabras de 9+ letras
- Máximo 5% de palabras con 7-8 letras
- Usar solo palabras muy cortas y muy frecuentes

### IDL 20-40 (Fácil)
- Oraciones de 8-10 palabras en promedio, NINGUNA mayor a 15
- Promedio de letras por palabra ≤ 4.5
- Máximo 3% de palabras de 9+ letras
- Máximo 10% de palabras con 7-8 letras

### IDL 40-60 (Medio)
- Oraciones de 10-14 palabras en promedio, máximo 20% mayores a 15
- Promedio de letras por palabra ≤ 5.0
- Máximo 8% de palabras de 9+ letras
- Máximo 15% de palabras con 7-8 letras

### IDL 60-80 (Difícil)
- Oraciones de hasta 18 palabras en promedio, máximo 50% mayores a 15
- Promedio de letras por palabra ≤ 5.5
- Máximo 12% de palabras de 9+ letras

## PRIORIDAD DE SIMPLIFICACIÓN (mayor impacto primero)

1. ELIMINAR palabras de 9+ letras (peso 1.5): "alimentación"→"comida", "temperatura"→"calor", "diferentes"→"otros", "descubrimiento"→"hallazgo", "características"→"rasgos", "necesitan"→"deben"
2. DIVIDIR oraciones >15 palabras (peso 1.2) en dos o más oraciones claras
3. ACORTAR oraciones al promedio del nivel (peso 1.0)
4. PREFERIR palabras cortas (peso 1.0): "utilizar"→"usar", "poseer"→"tener", "realizar"→"hacer", "pequeño"→"chico"
5. REDUCIR palabras de 7-8 letras (peso 1.0): "también"→"y", "algunos"→"unos", "momento"→"rato"

## CRITERIOS CLÍNICOS PARA DISLEXIA

- Sílabas directas (CA-SA, LU-NA) sobre complejas (TRANS, BLAN, PREN)
- Palabras frecuentes del español cotidiano
- Sustantivos concretos e imaginables (casa, perro, río) sobre abstractos (concepto, proceso)
- Mantener nombres propios sin modificar
- Si una palabra técnica es irremplazable (dinosaurio, volcán, planeta), mantenerla

## RESTRICCIONES

- NO inventar información
- NO cambiar el tipo de texto (narrativo→narrativo, informativo→informativo)
- El texto debe sonar natural, NUNCA telegráfico
- Mantener la coherencia y el hilo narrativo

## FORMATO DE RESPUESTA

JSON puro, sin markdown, sin backticks:
{"simplified_text": "texto aquí"}`

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
    { label: "Rare (% palabras 9+ letras)", value: structural.rare_word_ratio, target: targets.rare_word_ratio, weight: 1.5, isRatio: true },
    { label: "OL15 (% oraciones >15 palabras)", value: structural.long_sentence_ratio, target: targets.long_sentence_ratio, weight: 1.2, isRatio: true },
    { label: "LMO (palabras/oración)", value: structural.avg_words_per_sentence, target: targets.avg_words_per_sentence, weight: 1.0, isRatio: false },
    { label: "LMP (letras/palabra)", value: structural.avg_letters_per_word, target: targets.avg_letters_per_word, weight: 1.0, isRatio: false },
    { label: "PL78 (% palabras 7-8 letras)", value: structural.medium_word_ratio, target: targets.medium_word_ratio, weight: 1.0, isRatio: true },
  ]

  const exceeding = variables
    .filter(v => v.value > v.target)
    .map(v => ({ ...v, impact: (v.value - v.target) * v.weight }))
    .sort((a, b) => b.impact - a.impact)

  const fmt = (v: typeof exceeding[0]) =>
    v.isRatio ? `${(v.value * 100).toFixed(1)}%` : v.value.toFixed(1)
  const fmtTarget = (v: typeof exceeding[0]) =>
    v.isRatio ? `≤${(v.target * 100).toFixed(0)}%` : `≤${v.target}`

  const exceedingList =
    exceeding.length > 0
      ? exceeding
          .map((v, i) => `${i + 1}. ${v.label}: ${fmt(v)} (objetivo: ${fmtTarget(v)}) — ${v.impact > 0.1 ? "impacto alto" : "impacto medio"}`)
          .join("\n")
      : "Todas las variables están dentro del objetivo. El IDL puede verse afectado por interacciones no lineales."

  return `Tu simplificación anterior dio un IDL de ${score.toFixed(1)} (objetivo: ${range.min}-${range.max}).

Métricas del microservicio (valores reales):
- LMO (palabras/oración): ${structural.avg_words_per_sentence.toFixed(1)} (normalizado: ${(structural.avg_words_per_sentence / 20).toFixed(3)})
- OL15 (% oraciones >15 palabras): ${(structural.long_sentence_ratio * 100).toFixed(1)}%
- LMP (letras/palabra): ${structural.avg_letters_per_word.toFixed(2)} (normalizado: ${(structural.avg_letters_per_word / 8).toFixed(3)})
- PL78 (% palabras 7-8 letras): ${(structural.medium_word_ratio * 100).toFixed(1)}%
- Rare (% palabras 9+ letras): ${(structural.rare_word_ratio * 100).toFixed(1)}%

Métricas léxicas de la base de datos clínica:
- Frecuencia promedio: ${lexical.avg_frequency.toFixed(2)} (escala 0-10, objetivo >6)
- Imaginabilidad promedio: ${lexical.avg_imageability.toFixed(2)} (escala 1-7, objetivo >4)
- Palabras no encontradas en DB clínica: ${(lexical.unknown_word_ratio * 100).toFixed(1)}%

Variables que MÁS necesitan bajar (ordenadas por impacto):
${exceedingList}

Reescribe el texto corrigiendo específicamente esas variables.
Responde solo con JSON: {"simplified_text": "texto corregido aquí"}`
}

export async function getSimplificationUsage(): Promise<{ usage_today: number; daily_limit: number }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
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

export async function analyzeTextForFilter(text: string): Promise<{ score: number } | null> {
  if (text.trim().length < 50) return null
  try {
    const result = await analyzeText(text)
    return result.score !== null ? { score: result.score } : null
  } catch {
    return null
  }
}

export async function simplifyText(text: string, level: DifficultyLevel): Promise<SimplifyResult> {
  if (!text || text.trim().length === 0) {
    return { success: false, error: "El texto no puede estar vacío." }
  }
  if (text.length > 5000) {
    return { success: false, error: "El texto no puede superar los 5000 caracteres." }
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

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const range = TARGET_RANGES[level]

  type Attempt = {
    simplified_text: string
    idl_score: number
    metrics: { structural: StructuralMetrics; lexical: LexicalMetrics }
    distance: number
  }

  let bestAttempt: Attempt | null = null
  const conversationHistory: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Nivel objetivo: ${range.label} (IDL ${range.min}-${range.max})\n\nTexto a simplificar:\n${text}`,
    },
  ]

  for (let attempt = 1; attempt <= 3; attempt++) {
    let claudeText: string

    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: conversationHistory,
      })

      const textBlock = response.content.find((b) => b.type === "text")
      if (!textBlock || textBlock.type !== "text") {
        return { success: false, error: "La API no devolvió un texto válido." }
      }

      conversationHistory.push({ role: "assistant", content: textBlock.text })

      const parsed = JSON.parse(textBlock.text.trim()) as { simplified_text: string }
      claudeText = parsed.simplified_text
    } catch {
      if (attempt === 1) return { success: false, error: "Error al llamar a la API de Claude." }
      break
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
      await supabase.from("text_simplification_logs").insert({ user_id: user.id })
      return {
        success: true,
        simplified_text: claudeText,
        idl_score: score,
        achievable: true,
        attempts: attempt,
        metrics: { structural: idlResult.structural, lexical: idlResult.lexical },
        usage_today: currentUsage + 1,
        daily_limit: DAILY_LIMIT,
      }
    }

    if (attempt < 3) {
      const feedback = buildFeedback(idlResult.structural, idlResult.lexical, score, level)
      conversationHistory.push({ role: "user", content: feedback })
    }
  }

  await supabase.from("text_simplification_logs").insert({ user_id: user.id })

  return {
    success: true,
    simplified_text: bestAttempt!.simplified_text,
    idl_score: bestAttempt!.idl_score,
    achievable: false,
    attempts: 3,
    metrics: bestAttempt!.metrics,
    usage_today: currentUsage + 1,
    daily_limit: DAILY_LIMIT,
  }
}
