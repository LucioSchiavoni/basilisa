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

type Level = "muy_facil" | "facil" | "medio" | "dificil"

const LEVELS: { value: Level; label: string; idl: string; max: number }[] = [
  { value: "muy_facil", label: "Muy fácil", idl: "IDL 0–20", max: 20 },
  { value: "facil",     label: "Fácil",     idl: "IDL 20–40", max: 40 },
  { value: "medio",     label: "Medio",     idl: "IDL 40–60", max: 60 },
  { value: "dificil",   label: "Difícil",   idl: "IDL 60–80", max: 80 },
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
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={cn("opacity-40 transition-transform shrink-0", open && "rotate-180")}>
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
              className={cn("flex w-full items-center justify-between gap-3 px-3 py-2 text-[11px] transition-colors hover:bg-accent", l.value === value ? "bg-accent/60" : "")}
            >
              <span className={cn("font-medium", l.value === value ? "text-foreground" : "text-foreground/80")}>{l.label}</span>
              <span className="text-muted-foreground tabular-nums">{l.idl}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function UsageDots({ used, total }: { used: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            i < used ? "bg-[#2E85C8]" : "bg-border"
          )}
        />
      ))}
      <span className="text-[11px] text-muted-foreground/60 ml-1 tabular-nums">{used}/{total} hoy</span>
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

export default function SimplificadorPagePatient() {
  const [text, setText] = useState("")
  const [level, setLevel] = useState<Level>("facil")
  const [resultData, setResultData] = useState<ResultData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [usageToday, setUsageToday] = useState<number | null>(null)
  const [dailyLimit, setDailyLimit] = useState(5)
  const [originalIdl, setOriginalIdl] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

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

  function handleCopy() {
    if (!resultData) return
    navigator.clipboard.writeText(resultData.simplified_text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex flex-col items-center px-0 py-2 sm:py-10 sm:min-h-[calc(100vh-8rem)] sm:justify-center">
      <div className="w-full max-w-2xl space-y-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-xl sm:text-2xl font-light tracking-widest uppercase">Simplificador</h1>
          {usageToday !== null && (
            <UsageDots used={usageToday} total={dailyLimit} />
          )}
        </div>

        {limitReached && (
          <div className="rounded-xl border border-border/60 bg-card px-4 py-3 text-center">
            <p className="text-sm text-muted-foreground font-light">
              Usaste tus {dailyLimit} simplificaciones de hoy. ¡Volvé mañana!
            </p>
          </div>
        )}

        {noLevelsAvailable && !limitReached && (
          <div className="rounded-xl border border-border/60 bg-card px-4 py-3 text-center">
            <p className="text-sm text-muted-foreground font-light">
              Este texto ya es muy fácil (IDL {originalIdl?.toFixed(1)}).
            </p>
          </div>
        )}

        <div
          className="rounded-xl border border-border/60 bg-card flex flex-col"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 6px 20px rgba(0,0,0,0.09), 0 20px 48px -8px rgba(0,0,0,0.14)" }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pegá o escribí el texto que querés simplificar..."
            rows={7}
            disabled={limitReached}
            className="w-full resize-none bg-transparent px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4 text-sm leading-relaxed font-light placeholder:text-muted-foreground/40 focus:outline-none disabled:opacity-50"
            style={{ resize: "none" }}
          />

          <div className="flex items-center justify-between gap-2 px-4 pb-4">
            <span className={cn("text-[11px] tabular-nums", overLimit ? "text-red-500 font-semibold" : "text-muted-foreground/40")}>
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              <LevelDropdown value={level} onChange={setLevel} originalIdl={originalIdl} />
              <button
                type="button"
                onClick={handleSimplify}
                disabled={isPending || overLimit || limitReached || !text.trim() || noLevelsAvailable}
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
        </div>

        {(isPending || resultData || error) && (
          <div
            className="rounded-xl border border-border/60 bg-card overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.08)" }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <p className="text-xs font-light tracking-wide text-muted-foreground">Texto simplificado</p>
                {resultData && (
                  <span className="inline-flex items-center rounded-md bg-[#2E85C8]/10 px-2 py-0.5 text-[11px] font-medium text-[#2E85C8]">
                    IDL {resultData.idl_score.toFixed(1)}
                  </span>
                )}
                {resultData && resultData.attempts > 1 && (
                  <span className="text-[10px] text-muted-foreground/60">
                    {resultData.attempts} iteraciones
                  </span>
                )}
              </div>
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
            </div>
            {isPending ? (
              <div className="px-5 py-4">
                <p className="text-xs text-muted-foreground mb-3">Simplificando y verificando con análisis clínico...</p>
                <TypewriterLoading />
              </div>
            ) : error ? (
              <p className="p-5 text-sm font-light text-red-500">{error}</p>
            ) : resultData ? (
              <div className="p-5">
                {!resultData.achievable && (
                  <div className="mb-4 rounded-lg border border-amber-300/60 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-700/40 px-3 py-2.5">
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                      No fue posible alcanzar el nivel objetivo. IDL alcanzado: {resultData.idl_score.toFixed(1)}.
                      Esto puede ocurrir cuando el contenido requiere palabras técnicas que no pueden simplificarse más sin perder el sentido.
                    </p>
                  </div>
                )}
                <p className="text-sm font-light leading-relaxed whitespace-pre-wrap tracking-wide">{resultData.simplified_text}</p>
                <div className="mt-4 rounded-lg border border-border/40 bg-muted/30 px-4 py-3">
                  <p className="text-[11px] font-medium text-muted-foreground mb-2 tracking-wide uppercase">Métricas</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <MetricRow label="Palabras por oración" value={resultData.metrics.structural.avg_words_per_sentence.toFixed(1)} />
                    <MetricRow label="Oraciones largas" value={`${(resultData.metrics.structural.long_sentence_ratio * 100).toFixed(1)}%`} />
                    <MetricRow label="Letras por palabra" value={resultData.metrics.structural.avg_letters_per_word.toFixed(2)} />
                    <MetricRow label="Palabras medianas" value={`${(resultData.metrics.structural.medium_word_ratio * 100).toFixed(1)}%`} />
                    <MetricRow label="Palabras largas (9+)" value={`${(resultData.metrics.structural.rare_word_ratio * 100).toFixed(1)}%`} />
                    <MetricRow label="Frecuencia léxica" value={resultData.metrics.lexical.avg_frequency.toFixed(2)} />
                    <MetricRow label="Imaginabilidad" value={resultData.metrics.lexical.avg_imageability.toFixed(2)} />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
