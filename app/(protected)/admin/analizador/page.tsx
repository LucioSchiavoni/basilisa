"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { analyzeTextAction } from "./actions"
import type { IDLAnalysisResult } from "@/lib/services/idl"

function fmt1(n: number) {
  return n.toFixed(1)
}

function fmtPct(n: number) {
  return `${(n * 100).toFixed(1)}%`
}

function MetricRow({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: "green" | "red" | "neutral"
}) {
  const colorClass =
    color === "green"
      ? "text-green-600"
      : color === "red"
        ? "text-red-500"
        : "text-foreground"

  return (
    <div className="flex justify-between items-center py-1.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${colorClass}`}>{value}</span>
    </div>
  )
}

function difficultyColor(value: number, thresholds: { easy: number; hard: number }) {
  if (value <= thresholds.easy) return "green"
  if (value >= thresholds.hard) return "red"
  return "neutral"
}

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
      {[0, 1].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-5 w-40 bg-muted rounded" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="flex justify-between">
                <div className="h-4 w-36 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const LEVEL_DATA: Record<number, { label: string; description: string; color: string }> = {
  1: { label: "Muy fácil",   description: "Vocabulario simple y oraciones cortas",             color: "#579F93" },
  2: { label: "Fácil",       description: "Lectura accesible para lectores en desarrollo",      color: "#6BAD72" },
  3: { label: "Moderado",    description: "Requiere vocabulario y comprensión media",           color: "#D3A021" },
  4: { label: "Difícil",     description: "Estructuras complejas y vocabulario variado",        color: "#E07B3A" },
  5: { label: "Muy difícil", description: "Alto nivel de complejidad léxica y sintáctica",     color: "#D4623A" },
  6: { label: "Avanzado",    description: "Texto especializado para lectores expertos",         color: "#C73341" },
}

function DifficultyScore({ score }: { score: number }) {
  const level = Math.min(6, Math.max(1, Math.round(score)))
  const pct = Math.round((level / 6) * 100)
  const { label, description, color } = LEVEL_DATA[level]

  return (
    <Card className="mb-6" style={{ borderLeft: `4px solid ${color}` }}>
      <CardContent className="pt-5 pb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Índice de Dificultad Lectora
        </p>
        <div className="flex items-start gap-5 mb-5">
          <div
            className="flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: color }}
          >
            <span className="text-2xl font-black leading-none">{level}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider leading-none mt-0.5">de 6</span>
          </div>
          <div className="flex flex-col justify-center pt-1 gap-0.5">
            <span className="text-xl font-bold leading-tight">{label}</span>
            <span className="text-sm text-muted-foreground">{description}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>
          <div className="flex justify-between px-0.5">
            {Object.entries(LEVEL_DATA).map(([lvl, d]) => (
              <div key={lvl} className="flex flex-col items-center gap-0.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${Number(lvl) > level ? "bg-muted-foreground/25" : ""}`}
                  style={{ backgroundColor: Number(lvl) <= level ? d.color : undefined }}
                />
                <span
                  className="text-[9px] font-semibold transition-colors"
                  style={{ color: Number(lvl) === level ? color : undefined, opacity: Number(lvl) === level ? 1 : 0.4 }}
                >
                  {lvl}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AnalysisResults({ result }: { result: IDLAnalysisResult }) {
  const { structural: s, lexical: l } = result

  return (
    <div>
      {result.score !== null && <DifficultyScore score={result.score} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Métricas Estructurales</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricRow label="Palabras" value={String(s.word_count)} />
            <MetricRow label="Oraciones" value={String(s.sentence_count)} />
            <MetricRow
              label="Palabras por oración"
              value={fmt1(s.avg_words_per_sentence)}
              color={difficultyColor(s.avg_words_per_sentence, { easy: 10, hard: 20 })}
            />
            <MetricRow
              label="Oraciones largas (>15 palabras)"
              value={fmtPct(s.long_sentence_ratio)}
              color={difficultyColor(s.long_sentence_ratio, { easy: 0.2, hard: 0.5 })}
            />
            <MetricRow
              label="Letras por palabra"
              value={fmt1(s.avg_letters_per_word)}
              color={difficultyColor(s.avg_letters_per_word, { easy: 4.5, hard: 7 })}
            />
            <MetricRow
              label="Palabras largas (≥6 letras)"
              value={fmtPct(s.long_word_ratio)}
              color={difficultyColor(s.long_word_ratio, { easy: 0.2, hard: 0.5 })}
            />
            <MetricRow
              label="Sílabas por palabra"
              value={fmt1(s.avg_syllables_per_word)}
              color={difficultyColor(s.avg_syllables_per_word, { easy: 2, hard: 3.5 })}
            />
            <MetricRow
              label="Diversidad léxica"
              value={fmtPct(s.type_token_ratio)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Métricas Léxicas</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricRow
              label="Frecuencia promedio"
              value={fmt1(l.avg_frequency)}
              color={
                l.avg_frequency >= 7
                  ? "green"
                  : l.avg_frequency <= 4
                    ? "red"
                    : "neutral"
              }
            />
            <MetricRow
              label="Palabras poco frecuentes"
              value={fmtPct(l.low_frequency_ratio)}
              color={difficultyColor(l.low_frequency_ratio, { easy: 0.15, hard: 0.4 })}
            />
            <MetricRow
              label="Sílabas complejas"
              value={fmtPct(l.complex_syllable_ratio)}
              color={difficultyColor(l.complex_syllable_ratio, { easy: 0.1, hard: 0.35 })}
            />
            <MetricRow
              label="Imaginabilidad promedio"
              value={fmt1(l.avg_imageability)}
              color={
                l.avg_imageability >= 6
                  ? "green"
                  : l.avg_imageability <= 3
                    ? "red"
                    : "neutral"
              }
            />
            <MetricRow
              label="Cobertura de imaginabilidad"
              value={fmtPct(l.imageability_coverage)}
              color={
                l.imageability_coverage >= 0.7
                  ? "green"
                  : l.imageability_coverage <= 0.4
                    ? "red"
                    : "neutral"
              }
            />
            <MetricRow
              label="Palabras no encontradas"
              value={fmtPct(l.unknown_word_ratio)}
              color={difficultyColor(l.unknown_word_ratio, { easy: 0.05, hard: 0.25 })}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AnalizadorPage() {
  const [text, setText] = useState("")
  const [result, setResult] = useState<IDLAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAnalyze() {
    setError(null)
    startTransition(async () => {
      const res = await analyzeTextAction(text)
      if (res.error) {
        setError(res.error)
        setResult(null)
      } else if (res.data) {
        setResult(res.data)
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analizador de Textos</h1>
        <p className="text-muted-foreground mt-1">
          Analiza la dificultad lectora de cualquier texto
        </p>
      </div>

      <div className="space-y-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Pega o escribe un texto aquí para analizar su dificultad lectora..."
          rows={6}
          className="resize-y"
        />
        <Button onClick={handleAnalyze} disabled={isPending || !text.trim()}>
          {isPending ? "Analizando..." : "Analizar"}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {isPending && <ResultsSkeleton />}

      {!isPending && result && <AnalysisResults result={result} />}
    </div>
  )
}
