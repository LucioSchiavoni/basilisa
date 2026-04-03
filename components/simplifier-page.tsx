"use client"

import Link from "next/link"
import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { simplifyText, analyzeTextForFilter } from "@/lib/actions/simplify-text"
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

type SimplifierPageProps = {
  mode: "admin" | "patient"
  initialUsageToday: number
  initialDailyLimit: number
}

const LEVELS: { value: Level; label: string; idl: string; max: number }[] = [
  { value: "muy_facil", label: "Muy fácil", idl: "IDL 0-20", max: 20 },
  { value: "facil", label: "Fácil", idl: "IDL 20-40", max: 40 },
  { value: "medio", label: "Medio", idl: "IDL 40-60", max: 60 },
  { value: "dificil", label: "Difícil", idl: "IDL 60-80", max: 80 },
]

const MAX_CHARS = 5000
const BUTTON_COOLDOWN_MS = 1500

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-[11px] font-medium tabular-nums">{value}</span>
    </div>
  )
}

function MetricsCard({ metrics }: { metrics: { structural: StructuralMetrics; lexical: LexicalMetrics } }) {
  const { structural, lexical } = metrics
  return (
    <div className="mt-4 rounded-lg border border-border/40 bg-muted/30 px-4 py-3">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Métricas del texto simplificado</p>
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

function UsageCounter({ used, total }: { used: number; total: number }) {
  return (
    <span className="text-[11px] tabular-nums text-muted-foreground/60">
      {used}/{total} hoy
    </span>
  )
}

function LastResultCard({
  resultData,
  onOpen,
}: {
  resultData: ResultData
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="hidden w-full cursor-pointer rounded-xl border border-border/60 bg-card px-4 py-4 text-left transition-colors hover:bg-accent/20 sm:block"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Ultimo resultado</p>
          <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
            {resultData.simplified_text}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-[#2E85C8]/10 px-2 py-1 text-[11px] font-medium text-[#2E85C8]">
            IDL {resultData.idl_score.toFixed(1)}
          </span>
          <span className="rounded-md border border-border/60 px-2 py-1 text-[11px] text-muted-foreground">
            Ver
          </span>
        </div>
      </div>
    </button>
  )
}

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
    if (originalIdl !== null && !availableLevels.find((l) => l.value === value) && availableLevels.length > 0) {
      onChange(availableLevels[availableLevels.length - 1].value)
    }
  }, [availableLevels, onChange, originalIdl, value])

  const displayLevels = originalIdl !== null ? availableLevels : LEVELS

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={displayLevels.length === 0}
        className="flex w-36 items-center justify-between gap-2 whitespace-nowrap rounded-lg border border-border/50 bg-background/40 px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 sm:w-44"
      >
        <span className="flex items-center gap-1.5">
          <span>{selected.label}</span>
          <span className="font-normal text-muted-foreground">{selected.idl}</span>
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={cn("shrink-0 opacity-40 transition-transform", open && "rotate-180")}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && displayLevels.length > 0 && (
        <div className="absolute bottom-full right-0 z-50 mb-1.5 min-w-44 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
          {displayLevels.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => {
                onChange(l.value)
                setOpen(false)
              }}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-3 py-2 text-[11px] transition-colors hover:bg-accent",
                l.value === value ? "bg-accent/60" : ""
              )}
            >
              <span className={cn("font-medium", l.value === value ? "text-foreground" : "text-foreground/80")}>
                {l.label}
              </span>
              <span className="tabular-nums text-muted-foreground">{l.idl}</span>
            </button>
          ))}
        </div>
      )}
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
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  function handleCopy() {
    if (!resultData) return
    navigator.clipboard.writeText(resultData.simplified_text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!isClient) return null

  return createPortal(
    <>
      <div
        className={cn(
          "fixed right-0 top-0 z-65 flex h-full w-full max-w-sm translate-x-full flex-col border-l border-border/60 bg-card transition-transform duration-300 ease-out",
          visible && "translate-x-0"
        )}
        style={{ boxShadow: "-4px 0 32px rgba(0,0,0,0.15)" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-5 py-4">
          <div className="flex items-center gap-2">
            {resultData && !resultData.achievable && (
              <button
                type="button"
                onClick={() => setWarningOpen(true)}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-amber-500 transition-colors hover:bg-amber-50 dark:hover:bg-amber-950/30"
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
                className="inline-flex cursor-pointer items-center rounded-md bg-[#2E85C8]/10 px-3 py-1 text-xs font-medium text-[#2E85C8] transition-colors hover:bg-[#2E85C8]/20"
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
                className="flex cursor-pointer items-center gap-1.5 text-xs font-light text-muted-foreground transition-colors hover:text-foreground"
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
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
            <p className="text-sm font-light leading-relaxed text-red-500">{error}</p>
          ) : resultData ? (
            <p className="whitespace-pre-wrap text-sm font-light leading-relaxed tracking-wide">{resultData.simplified_text}</p>
          ) : null}
        </div>
      </div>

      {metricsOpen && resultData && (
        <>
          <div className="fixed inset-0 z-70 bg-black/40" onClick={() => setMetricsOpen(false)} />
          <div className="fixed inset-x-2 top-1/2 z-75 -translate-y-1/2 rounded-xl border border-border/60 bg-card p-5 shadow-xl sm:inset-x-auto sm:right-96 sm:w-96">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Métricas</p>
              <button
                type="button"
                onClick={() => setMetricsOpen(false)}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
          className="fixed bottom-6 right-0 z-65 flex cursor-pointer items-center gap-2 rounded-l-xl border border-r-0 border-border/60 bg-card px-3 py-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
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
          <div className="fixed inset-0 z-70 bg-black/40" onClick={() => setWarningOpen(false)} />
          <div className="fixed inset-x-4 top-1/2 z-75 -translate-y-1/2 rounded-xl border border-amber-300/60 bg-card p-5 shadow-xl sm:inset-x-auto sm:right-96 sm:w-80">
            <div className="mb-2 flex items-start justify-between gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-amber-500">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" x2="12" y1="9" y2="13" />
                <line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
              <button
                type="button"
                onClick={() => setWarningOpen(false)}
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
              No fue posible alcanzar el nivel objetivo. IDL alcanzado: {resultData.idl_score.toFixed(1)}.
              Esto puede ocurrir cuando el contenido requiere palabras técnicas que no pueden simplificarse más sin perder el sentido.
            </p>
          </div>
        </>
      )}
    </>,
    document.body
  )
}

export function SimplifierPage({ mode, initialUsageToday, initialDailyLimit }: SimplifierPageProps) {
  const [text, setText] = useState("")
  const [level, setLevel] = useState<Level>("facil")
  const [resultData, setResultData] = useState<ResultData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [asideOpen, setAsideOpen] = useState(false)
  const [usageToday, setUsageToday] = useState<number | null>(initialUsageToday)
  const [dailyLimit, setDailyLimit] = useState(initialDailyLimit)
  const [originalIdl, setOriginalIdl] = useState<number | null>(null)
  const [cooldownUntil, setCooldownUntil] = useState<number>(0)
  const [isPending, startTransition] = useTransition()
  const submitLockRef = useRef(false)

  const storageKey = mode === "admin" ? "simplificador_admin_last_result" : "simplificador_patient_last_result"
  const draftStorageKey = mode === "admin" ? "simplificador_admin_draft" : "simplificador_patient_draft"

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) setResultData(JSON.parse(saved))
    } catch {}
  }, [storageKey])

  useEffect(() => {
    try {
      if (resultData) {
        localStorage.setItem(storageKey, JSON.stringify(resultData))
      }
    } catch {}
  }, [resultData, storageKey])

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(draftStorageKey)
      if (savedDraft) setText(savedDraft)
    } catch {}
  }, [draftStorageKey])

  useEffect(() => {
    try {
      localStorage.setItem(draftStorageKey, text)
    } catch {}
  }, [draftStorageKey, text])

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
  const cooldownActive = cooldownUntil > Date.now()

  const availableLevels = LEVELS.filter(
    (l) => originalIdl === null || l.max < originalIdl
  )
  const noLevelsAvailable = originalIdl !== null && availableLevels.length === 0

  function handleSimplify() {
    if (submitLockRef.current || cooldownActive || isPending || !text.trim() || overLimit || limitReached || noLevelsAvailable) {
      return
    }

    submitLockRef.current = true
    setCooldownUntil(Date.now() + BUTTON_COOLDOWN_MS)
    setError(null)
    setResultData(null)
    setAsideOpen(true)

    startTransition(async () => {
      try {
        const res: SimplifyResult = await simplifyText(text, level)
        if (res.success) {
          const nextResult = {
            simplified_text: res.simplified_text,
            idl_score: res.idl_score,
            achievable: res.achievable,
            attempts: res.attempts,
            metrics: res.metrics,
          }
          setResultData(nextResult)
          if (res.usage_today !== undefined) setUsageToday(res.usage_today)
          if (res.daily_limit !== undefined) setDailyLimit(res.daily_limit)
        } else {
          setError(res.error ?? "Error desconocido.")
          if (res.usage_today !== undefined) setUsageToday(res.usage_today)
          if (res.daily_limit !== undefined) setDailyLimit(res.daily_limit)
        }
      } finally {
        submitLockRef.current = false
      }
    })
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center",
        mode === "admin"
          ? "px-4 py-6 sm:min-h-[calc(100vh-8rem)] sm:justify-center sm:py-12"
          : "px-0 py-2 sm:min-h-[calc(100vh-8rem)] sm:justify-center sm:py-10"
      )}
    >
      <ResultAside
        resultData={resultData}
        error={error}
        isPending={isPending}
        open={asideOpen}
        onClose={() => setAsideOpen(false)}
        onOpen={() => setAsideOpen(true)}
      />

      <div className={cn("w-full space-y-4", mode === "admin" ? "max-w-3xl" : "max-w-2xl")}>
        <div className={cn(mode === "admin" ? "text-center" : "flex flex-col items-center gap-1 text-center")}>
          <h1 className={cn("font-light uppercase tracking-widest", mode === "admin" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl")}>
            {mode === "admin" ? "Simplificador de Textos" : "Simplificador"}
          </h1>
        </div>

        {limitReached && mode === "patient" && (
          <div className="rounded-2xl border border-border/60 bg-card/95 px-4 py-4 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.35)] sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  Alcanzaste el límite diario
                </p>
                <p className="text-sm font-light leading-relaxed text-muted-foreground">
                  Ya usaste tus {dailyLimit} simplificaciones de hoy. Si necesitás más intentos, podés cambiar a un plan superior.
                </p>
              </div>
              <Link
                href="/planes"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-[#2E85C8]/25 bg-[#2E85C8] px-4 text-sm font-medium text-white transition-colors hover:bg-[#276fa7]"
              >
                Mejorar plan
              </Link>
            </div>
          </div>
        )}

        {noLevelsAvailable && (!limitReached || mode === "admin") && (
          <div className="rounded-lg border border-border/60 bg-card px-4 py-3 text-center">
            <p className="text-sm font-light text-muted-foreground">
              Este texto ya es muy fácil (IDL {originalIdl?.toFixed(1)}).
            </p>
          </div>
        )}

        <div
          className={cn("flex flex-col border border-border/60 bg-card", mode === "admin" ? "rounded-lg" : "rounded-xl")}
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 6px 20px rgba(0,0,0,0.09), 0 20px 48px -8px rgba(0,0,0,0.14)" }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={mode === "admin"
              ? "Pegá o escribí el texto que querés transformar... cuanto más oscuro el texto, más lo iluminamos."
              : "Pegá o escribí el texto que querés simplificar..."}
            rows={mode === "admin" ? 8 : 7}
            disabled={limitReached && mode === "patient"}
            className={cn(
              "w-full resize-none bg-transparent px-4 pb-3 pt-4 text-sm leading-relaxed focus:outline-none sm:px-5",
              mode === "admin"
                ? "placeholder:text-muted-foreground/40 sm:pb-4 sm:pt-5"
                : "font-light placeholder:text-muted-foreground/40 disabled:opacity-50 sm:pb-4 sm:pt-5"
            )}
            style={{ resize: "none" }}
          />

          <div className={cn(
            "px-4 pb-4",
            mode === "admin" ? "flex items-center justify-end gap-2" : "flex items-center justify-between gap-2"
          )}>
            {mode === "patient" && (
              <span className={cn("text-[11px] tabular-nums", overLimit ? "font-semibold text-red-500" : "text-muted-foreground/40")}>
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
            )}

            <div className="flex items-center gap-2">
              <LevelDropdown value={level} onChange={setLevel} originalIdl={originalIdl} />
              <button
                type="button"
                onClick={handleSimplify}
                disabled={isPending || cooldownActive || overLimit || limitReached || !text.trim() || noLevelsAvailable}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-white transition-all hover:opacity-90 active:scale-95",
                  !text.trim() || overLimit || limitReached || noLevelsAvailable || cooldownActive ? "opacity-40" : "cursor-pointer opacity-100"
                )}
                style={{ backgroundColor: "#2E85C8" }}
                aria-label="Simplificar texto"
                title={cooldownActive ? "Esperá un instante antes de volver a simplificar" : "Simplificar texto"}
              >
                {isPending ? (
                  <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            {mode === "patient" && usageToday !== null && (
              <UsageCounter used={usageToday} total={dailyLimit} />
            )}
            {mode === "admin" ? (
              <span className={cn("text-[11px] tabular-nums", limitReached ? "font-semibold text-red-500" : "text-muted-foreground/55")}>
                {usageToday ?? 0}/{dailyLimit} hoy
              </span>
            ) : cooldownActive ? (
              <span className="text-[11px] text-muted-foreground/55">
                Esperá un instante para volver a intentar.
              </span>
            ) : null}
          </div>

          <span className={cn("text-[11px] tabular-nums", overLimit ? "font-semibold text-red-500" : "text-muted-foreground/55")}>
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        </div>

        {resultData && (
          <LastResultCard
            resultData={resultData}
            onOpen={() => setAsideOpen(true)}
          />
        )}
      </div>
    </div>
  )
}
