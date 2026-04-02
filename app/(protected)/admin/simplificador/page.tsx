"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { simplifyText, getSimplificationUsage, analyzeTextForFilter } from "@/lib/actions/simplify-text"
import type { SimplifyResult } from "@/lib/actions/simplify-text"
import type { StructuralMetrics, LexicalMetrics } from "@/lib/services/idl"
import { TypewriterLoading } from "@/components/typewriter-loading"

type ResultData = {
  simplified_text: string
  idl_score: number
  achievable: boolean
  attempts: number
  metrics: { structural: StructuralMetrics; lexical: LexicalMetrics }
}

function MetricsCard({ metrics }: { metrics: { structural: StructuralMetrics; lexical: LexicalMetrics } }) {
  const { structural, lexical } = metrics
  return (
    <div className="mt-4 rounded-lg border border-border/40 bg-muted/30 px-4 py-3">
      <p className="text-[11px] font-medium text-muted-foreground mb-2 tracking-wide uppercase">Métricas del texto simplificado</p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
        <MetricRow label="Palabras por oración" value={structural.avg_words_per_sentence.toFixed(1)} />
        <MetricRow label="Oraciones largas (>15 pal.)" value={`${(structural.long_sentence_ratio * 100).toFixed(1)}%`} />
        <MetricRow label="Letras por palabra" value={structural.avg_letters_per_word.toFixed(2)} />
        <MetricRow label="Palabras medianas (7-8 l.)" value={`${(structural.medium_word_ratio * 100).toFixed(1)}%`} />
        <MetricRow label="Palabras largas (9+ letras)" value={`${(structural.rare_word_ratio * 100).toFixed(1)}%`} />
        <MetricRow label="Frecuencia léxica" value={lexical.avg_frequency.toFixed(2)} />
        <MetricRow label="Imaginabilidad" value={lexical.avg_imageability.toFixed(2)} />
      </div>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-[11px] font-medium tabular-nums">{value}</span>
    </div>
  )
}


function ResultAside({
  resultData,
  error,
  isPending,
  open,
  onClose,
  onOpen,
}: {
  resultData: ResultData | null
  error: string | null
  isPending: boolean
  open: boolean
  onClose: () => void
  onOpen: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [metricsOpen, setMetricsOpen] = useState(false)
  const [warningOpen, setWarningOpen] = useState(false)
  const visible = open && (isPending || !!resultData || !!error)

  function handleCopy() {
    if (!resultData) return
    navigator.clipboard.writeText(resultData.simplified_text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-sm z-65 flex flex-col bg-card border-l border-border/60 transition-transform duration-300 ease-out",
          visible ? "translate-x-0" : "translate-x-full"
        )}
        style={{ boxShadow: "-4px 0 32px rgba(0,0,0,0.15)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-2">
            {resultData && !resultData.achievable && (
              <button
                type="button"
                onClick={() => setWarningOpen(true)}
                className="flex items-center justify-center w-6 h-6 rounded-md text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
                aria-label="Ver advertencia"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" x2="12" y1="9" y2="13" />
                  <line x1="12" x2="12.01" y1="17" y2="17" />
                </svg>
              </button>
            )}
            {resultData && (
              <button
                type="button"
                onClick={() => setMetricsOpen(true)}
                className="inline-flex items-center rounded-md bg-[#2E85C8]/10 px-3 py-1 text-xs font-medium text-[#2E85C8] cursor-pointer hover:bg-[#2E85C8]/20 transition-colors"
              >
                IDL {resultData.idl_score.toFixed(1)}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {resultData && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-light text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copiado
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    Copiar
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {isPending ? (
            <TypewriterLoading />
          ) : error ? (
            <p className="text-sm font-light text-red-500 leading-relaxed">{error}</p>
          ) : resultData ? (
            <p className="text-sm font-light leading-relaxed whitespace-pre-wrap tracking-wide">{resultData.simplified_text}</p>
          ) : null}
        </div>
      </div>

      {metricsOpen && resultData && (
        <>
          <div className="fixed inset-0 bg-black/40 z-70" onClick={() => setMetricsOpen(false)} />
          <div className="fixed inset-x-2 sm:inset-x-auto sm:right-96 sm:w-96 top-1/2 -translate-y-1/2 z-75 bg-card rounded-xl border border-border/60 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Métricas</p>
              <button
                type="button"
                onClick={() => setMetricsOpen(false)}
                className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <MetricsCard metrics={resultData.metrics} />
          </div>
        </>
      )}

      {!open && resultData && (
        <button
          type="button"
          onClick={onOpen}
          className="fixed bottom-6 right-0 z-65 flex items-center gap-2 bg-card border border-border/60 border-r-0 rounded-l-xl px-3 py-3 text-xs font-medium text-foreground transition-colors hover:bg-accent cursor-pointer"
          style={{ boxShadow: "-3px 2px 16px rgba(0,0,0,0.18)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Resultado
        </button>
      )}

      {warningOpen && resultData && (
        <>
          <div className="fixed inset-0 bg-black/40 z-70" onClick={() => setWarningOpen(false)} />
          <div className="fixed inset-x-4 sm:inset-x-auto sm:right-96 sm:w-80 top-1/2 -translate-y-1/2 z-75 bg-card rounded-xl border border-amber-300/60 p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 shrink-0 mt-0.5">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" x2="12" y1="9" y2="13" />
                <line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
              <button
                type="button"
                onClick={() => setWarningOpen(false)}
                className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              No fue posible alcanzar el nivel objetivo. IDL alcanzado: {resultData.idl_score.toFixed(1)}.
              Esto puede ocurrir cuando el contenido requiere palabras técnicas que no pueden simplificarse más sin perder el sentido.
            </p>
          </div>
        </>
      )}
    </>
  )
}

type Level = "muy_facil" | "facil" | "medio" | "dificil"

const LEVELS: { value: Level; label: string; idl: string; max: number }[] = [
  { value: "muy_facil", label: "Muy fácil", idl: "IDL 0–20", max: 20 },
  { value: "facil", label: "Fácil", idl: "IDL 20–40", max: 40 },
  { value: "medio", label: "Medio", idl: "IDL 40–60", max: 60 },
  { value: "dificil", label: "Difícil", idl: "IDL 60–80", max: 80 },
]

const MAX_CHARS = 5000

function LevelDropdown({
  value,
  onChange,
  originalIdl,
}: {
  value: Level
  onChange: (v: Level) => void
  originalIdl: number | null
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = LEVELS.find((l) => l.value === value)!

  const availableLevels = LEVELS.filter(
    (l) => originalIdl === null || l.max < originalIdl
  )

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  useEffect(() => {
    if (originalIdl !== null && !availableLevels.find((l) => l.value === value)) {
      if (availableLevels.length > 0) {
        onChange(availableLevels[availableLevels.length - 1].value)
      }
    }
  }, [originalIdl])

  const displayLevels = originalIdl !== null ? availableLevels : LEVELS

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={displayLevels.length === 0}
        className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-background/40 px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-accent transition-colors focus:outline-none whitespace-nowrap cursor-pointer w-36 sm:w-44 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span className="flex items-center gap-1.5">
          <span>{selected.label}</span>
          <span className="text-muted-foreground font-normal">{selected.idl}</span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("opacity-40 transition-transform shrink-0", open && "rotate-180")}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && displayLevels.length > 0 && (
        <div className="absolute bottom-full mb-1.5 right-0 z-50 min-w-44 rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
          {displayLevels.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => { onChange(l.value); setOpen(false) }}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-3 py-2 text-[11px] transition-colors hover:bg-accent",
                l.value === value ? "bg-accent/60" : ""
              )}
            >
              <span className={cn("font-medium", l.value === value ? "text-foreground" : "text-foreground/80")}>
                {l.label}
              </span>
              <span className="text-muted-foreground tabular-nums">{l.idl}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const LS_KEY = "simplificador_last_result"

export default function SimplificadorPage() {
  const [text, setText] = useState("")
  const [level, setLevel] = useState<Level>("facil")
  const [resultData, setResultData] = useState<ResultData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [asideOpen, setAsideOpen] = useState(false)
  const [usageToday, setUsageToday] = useState<number | null>(null)
  const [dailyLimit, setDailyLimit] = useState(5)
  const [originalIdl, setOriginalIdl] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) setResultData(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    if (resultData) {
      try { localStorage.setItem(LS_KEY, JSON.stringify(resultData)) } catch {}
    }
  }, [resultData])

  useEffect(() => {
    getSimplificationUsage().then(({ usage_today, daily_limit }) => {
      setUsageToday(usage_today)
      setDailyLimit(daily_limit)
    })
  }, [])

  useEffect(() => {
    if (text.trim().length < 50) {
      setOriginalIdl(null)
      return
    }
    const timer = setTimeout(() => {
      analyzeTextForFilter(text).then((res) => {
        setOriginalIdl(res?.score ?? null)
      })
    }, 800)
    return () => clearTimeout(timer)
  }, [text])

  const charCount = text.length
  const overLimit = charCount > MAX_CHARS
  const limitReached = usageToday !== null && usageToday >= dailyLimit

  const availableLevels = LEVELS.filter(
    (l) => originalIdl === null || l.max < originalIdl
  )
  const noLevelsAvailable = originalIdl !== null && availableLevels.length === 0

  function handleSimplify() {
    setError(null)
    setResultData(null)
    setAsideOpen(true)
    startTransition(async () => {
      const res: SimplifyResult = await simplifyText(text, level)
      if (res.success) {
        setResultData({
          simplified_text: res.simplified_text,
          idl_score: res.idl_score,
          achievable: res.achievable,
          attempts: res.attempts,
          metrics: res.metrics,
        })
        if (res.usage_today !== undefined) setUsageToday(res.usage_today)
      } else {
        setError(res.error ?? "Error desconocido.")
        if (res.usage_today !== undefined) setUsageToday(res.usage_today)
      }
    })
  }

  return (
    <div className="flex flex-col items-center px-4 py-6 sm:py-12 sm:min-h-[calc(100vh-8rem)] sm:justify-center">
      <ResultAside
        resultData={resultData}
        error={error}
        isPending={isPending}
        open={asideOpen}
        onClose={() => setAsideOpen(false)}
        onOpen={() => setAsideOpen(true)}
      />

      <div className="w-full max-w-3xl space-y-4">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-light tracking-widest uppercase">Simplificador de Textos</h1>
        </div>

        {noLevelsAvailable && (
          <div className="rounded-lg border border-border/60 bg-card px-4 py-3 text-center">
            <p className="text-sm text-muted-foreground font-light">
              Este texto ya es muy fácil (IDL {originalIdl?.toFixed(1)}).
            </p>
          </div>
        )}

        <div
          className="rounded-lg border border-border/60 bg-card flex flex-col"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 6px 20px rgba(0,0,0,0.09), 0 20px 48px -8px rgba(0,0,0,0.14)",
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pegá o escribí el texto que querés transformar... cuanto más oscuro el texto, más lo iluminamos."
            rows={8}
            className="w-full resize-none bg-transparent px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4 text-sm leading-relaxed placeholder:text-muted-foreground/40 focus:outline-none [&::-webkit-resizer]:hidden"
            style={{ resize: "none" }}
          />

          <div className="flex items-center justify-end gap-2 px-4 pb-4">
            <LevelDropdown value={level} onChange={setLevel} originalIdl={originalIdl} />

            <button
              type="button"
              onClick={handleSimplify}
              disabled={isPending || overLimit || limitReached || noLevelsAvailable}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer text-white hover:opacity-90 active:scale-95",
                !text.trim() || overLimit || limitReached || noLevelsAvailable ? "opacity-40" : "opacity-100"
              )}
              style={{ backgroundColor: "#2E85C8" }}
            >
              {isPending ? (
                <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          {usageToday !== null ? (
            <span className={cn("text-[11px] tabular-nums", limitReached ? "text-red-500 font-semibold" : "text-muted-foreground/55")}>
              {usageToday}/{dailyLimit} hoy
            </span>
          ) : (
            <span />
          )}
          <span className={cn("text-[11px] tabular-nums", overLimit ? "text-red-500 font-semibold" : "text-muted-foreground/55")}>
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        </div>

      </div>
    </div>
  )
}
