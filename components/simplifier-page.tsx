"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { simplifyText, analyzeTextForFilter } from "@/lib/actions/simplify-text"
import { extractDocumentAction } from "@/app/(protected)/(patient)/simplificador/actions"
import { generateQuestions } from "@/lib/actions/generate-questions"
import { saveSimplificationSession, updateSessionQuestions, getSimplificationSessions } from "@/lib/actions/simplification-sessions"
import type { SimplifyResult, GlossaryEntry } from "@/lib/actions/simplify-text"
import type { StructuralMetrics, LexicalMetrics } from "@/lib/services/idl"
import { TypewriterLoading } from "@/components/typewriter-loading"
import { SimplifierPdfModal } from "@/components/simplifier-pdf-modal"
import Link from "next/dist/client/link"

type ResultData = {
  simplified_text: string
  glossary: GlossaryEntry[]
  idl_score: number
  metrics: { structural: StructuralMetrics; lexical: LexicalMetrics }
}

type Level = "inicial" | "intermedio" | "avanzado"

type Question = {
  question: string
  options: string[]
  correct_index: number
}

type RecentEntry = {
  id: string
  originalPreview: string
  originalText: string
  simplifiedText: string
  glossary: GlossaryEntry[]
  idlScore: number
  metrics: { structural: StructuralMetrics; lexical: LexicalMetrics }
  level: Level
  createdAt: number
  questions?: Question[]
}

type SimplifierPageProps = {
  mode: "admin" | "patient"
  initialUsageToday: number
  initialDailyLimit: number
  initialQuestionsUsageToday: number
  initialQuestionsLimit: number
}

const LEVELS: { value: Level; label: string; idl: string; max: number }[] = [
  { value: "inicial", label: "Inicial", idl: "IDL 0-30", max: 30 },
  { value: "intermedio", label: "Intermedio", idl: "IDL 30-55", max: 55 },
  { value: "avanzado", label: "Avanzado", idl: "IDL 55-80", max: 80 },
]

const MAX_CHARS = 5000
const BUTTON_COOLDOWN_MS = 1500

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return "Ahora"
  if (minutes < 60) return `Hace ${minutes} min`
  if (hours < 24) return `Hace ${hours}h`
  if (days === 1) return "Ayer"
  return `Hace ${days} días`
}

function IdlPill({ score }: { score: number }) {
  if (score <= 30)
    return <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-green-500/10 text-green-600">Inicial</span>
  if (score <= 55)
    return <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">Intermedio</span>
  return <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-red-500/10 text-red-600">Avanzado</span>
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border/40 bg-muted/30 px-3 py-4 gap-1 text-center">
      <span className="text-2xl font-semibold tabular-nums text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground leading-tight">{label}</span>
    </div>
  )
}

function MetricsCard({ metrics }: { metrics: { structural: StructuralMetrics; lexical: LexicalMetrics } }) {
  const { structural, lexical } = metrics
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Estructura</p>
        <div className="grid grid-cols-3 gap-2">
          <MetricTile label="Palabras por oración" value={structural.avg_words_per_sentence.toFixed(1)} />
          <MetricTile label="Letras por palabra" value={structural.avg_letters_per_word.toFixed(1)} />
          <MetricTile label="Oraciones largas" value={`${(structural.long_sentence_ratio * 100).toFixed(0)}%`} />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <MetricTile label="Palabras medianas" value={`${(structural.medium_word_ratio * 100).toFixed(0)}%`} />
          <MetricTile label="Palabras largas" value={`${(structural.rare_word_ratio * 100).toFixed(0)}%`} />
        </div>
      </div>
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Léxico</p>
        <div className="grid grid-cols-2 gap-2">
          <MetricTile label="Frecuencia léxica" value={lexical.avg_frequency.toFixed(2)} />
          <MetricTile label="Imaginabilidad" value={lexical.avg_imageability.toFixed(2)} />
        </div>
      </div>
    </div>
  )
}

function LevelDropdown({
  value,
  onChange,
  originalIdl,
  direction = "down",
}: {
  value: Level
  onChange: (v: Level) => void
  originalIdl: number | null
  direction?: "up" | "down"
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
        className="flex w-36 items-center justify-between gap-2 whitespace-nowrap rounded-lg border border-border/50 bg-background/40 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span>{selected.label}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={cn("shrink-0 opacity-40 transition-transform", open && "rotate-180")}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && displayLevels.length > 0 && (
        <div className={cn("absolute right-0 z-50 min-w-28 overflow-hidden rounded-xl border border-border bg-popover shadow-xl", direction === "up" ? "bottom-full mb-1.5" : "top-full mt-1.5")}>
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
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function AnnotatedText({ text, glossary }: { text: string; glossary: GlossaryEntry[] }) {
  const [activeTerm, setActiveTerm] = useState<string | null>(null)
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeTerm) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveTerm(null)
        setPopupPos(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [activeTerm])

  const tokens = text.split(/(\s+)/)
  const normalize = (w: string) => w.toLowerCase().replace(/[^a-záéíóúüñ]/gi, "")
  const glossaryMap = new Map(glossary.map((e) => [normalize(e.term), e]))

  function handleTokenClick(e: React.MouseEvent<HTMLSpanElement>, term: string) {
    if (activeTerm === term) {
      setActiveTerm(null)
      setPopupPos(null)
      return
    }
    const rect = (e.target as HTMLSpanElement).getBoundingClientRect()
    setActiveTerm(term)
    setPopupPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX })
  }

  const activeEntry = activeTerm ? glossaryMap.get(activeTerm) : null

  return (
    <div ref={containerRef}>
      <p className="whitespace-pre-wrap text-lg sm:text-xl lg:text-2xl leading-[1.85] font-light">
        {tokens.map((token, i) => {
          const key = normalize(token)
          const entry = glossaryMap.get(key)
          if (entry) {
            return (
              <span
                key={i}
                onClick={(e) => handleTokenClick(e, key)}
                className="text-[#2E85C8] cursor-pointer"
                style={{ borderBottom: "1.5px dotted #2E85C8" }}
              >
                {token}
              </span>
            )
          }
          return <span key={i}>{token}</span>
        })}
      </p>
      {activeEntry && popupPos && createPortal(
        <div
          className="fixed z-200 max-w-55 rounded-xl border border-border/60 bg-card p-3 shadow-xl"
          style={{ top: popupPos.top, left: popupPos.left }}
        >
          <p className="text-xs font-semibold text-foreground">{activeEntry.term}</p>
          <p className="mt-1 text-xs font-light text-muted-foreground">{activeEntry.definition}</p>
        </div>,
        document.body
      )}
    </div>
  )
}

function HistoryCard({
  entry,
  active,
  onLoad,
}: {
  entry: RecentEntry
  active: boolean
  onLoad: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(entry.originalText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={cn(
      "w-full rounded-lg border transition-all",
      active ? "bg-background border-border/50" : "border-transparent hover:bg-background hover:border-border/50"
    )}>
      <div className="flex items-start gap-1 px-2.5 pt-2 pb-2">
        <button
          type="button"
          onClick={onLoad}
          className="flex-1 text-left cursor-pointer min-w-0"
        >
          <p className="text-xs font-medium truncate text-foreground/80">{entry.originalPreview}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-muted-foreground/60">{formatRelativeTime(entry.createdAt)}</span>
            <IdlPill score={entry.idlScore} />
          </div>
        </button>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 mt-0.5 p-0.5 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={cn("text-muted-foreground/50 transition-transform", expanded && "rotate-180")}
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="px-2.5 pb-2 space-y-2">
          <div className="rounded-md bg-muted/50 border border-border/30 px-3 py-2 max-h-48 overflow-y-auto">
            <p className="text-[11px] leading-relaxed text-foreground/80 whitespace-pre-wrap">{entry.originalText}</p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium border border-border/40 bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
            )}
            {copied ? "Copiado" : "Copiar texto original"}
          </button>
        </div>
      )}
    </div>
  )
}

function QuestionsResult({ correct, total, onRetry }: { correct: number; total: number; onRetry: () => void }) {
  const percentage = Math.round((correct / total) * 100)
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - percentage / 100)
  const message = percentage >= 80 ? "¡Excelente trabajo!" : percentage >= 50 ? "Buen esfuerzo" : "Seguí practicando"

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4 py-4">
      <div className="relative">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/70" />
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="#2E85C8"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.7s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold tabular-nums">{percentage}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{correct} de {total} correctas</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{message}</p>
      </div>
      <div className="flex gap-2 w-full">
        <div className="flex-1 rounded-lg border border-green-500/30 bg-green-500/8 px-3 py-2.5 text-center">
          <p className="text-lg font-semibold text-green-600">{correct}</p>
          <p className="text-[10px] text-muted-foreground">Correctas</p>
        </div>
        <div className="flex-1 rounded-lg border border-red-400/30 bg-red-400/8 px-3 py-2.5 text-center">
          <p className="text-lg font-semibold text-red-500">{total - correct}</p>
          <p className="text-[10px] text-muted-foreground">Incorrectas</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="w-full text-xs py-2 rounded-lg border border-border/50 bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}

export function SimplifierPage({ mode, initialUsageToday, initialDailyLimit, initialQuestionsUsageToday, initialQuestionsLimit }: SimplifierPageProps) {
  const [text, setText] = useState("")
  const [level, setLevel] = useState<Level>("intermedio")
  const [resultData, setResultData] = useState<ResultData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<"input" | "result">("input")
  const [usageToday, setUsageToday] = useState<number | null>(initialUsageToday)
  const [dailyLimit, setDailyLimit] = useState(initialDailyLimit)
  const [originalIdl, setOriginalIdl] = useState<number | null>(null)
  const [clearModalOpen, setClearModalOpen] = useState(false)
  const [cooldownUntil, setCooldownUntil] = useState<number>(0)
  const [history, setHistory] = useState<RecentEntry[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionCount, setQuestionCount] = useState(3)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [questionsError, setQuestionsError] = useState<string | null>(null)
  const [questionsUsageToday, setQuestionsUsageToday] = useState(initialQuestionsUsageToday)
  const [questionsLimit, setQuestionsLimit] = useState(initialQuestionsLimit)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [questionsPhase, setQuestionsPhase] = useState<"playing" | "finished">("playing")
  const [metricsOpen, setMetricsOpen] = useState(false)
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mobileTab, setMobileTab] = useState<"recientes" | "simplificador" | "preguntas">("simplificador")
  const [isLg, setIsLg] = useState(false)
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [inputMode, setInputMode] = useState<"write" | "upload">("write")
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState<{ type: "limit" | "error"; message: string } | null>(null)
  const [extractionNotice, setExtractionNotice] = useState<"parser" | "vision" | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPending, startTransition] = useTransition()
  const submitLockRef = useRef(false)
  const skipAnimationRef = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [questionsWidth, setQuestionsWidth] = useState(300)
  const questionsResizingRef = useRef(false)
  const questionsResizeStartRef = useRef({ x: 0, width: 0 })

  const draftStorageKey = mode === "admin" ? "simplificador_admin_draft" : "simplificador_patient_draft"

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    setIsLg(mq.matches)
    const onChange = () => setIsLg(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!questionsResizingRef.current) return
      const diff = questionsResizeStartRef.current.x - e.clientX
      setQuestionsWidth(Math.max(240, Math.min(560, questionsResizeStartRef.current.width + diff)))
    }
    function onUp() {
      if (!questionsResizingRef.current) return
      questionsResizingRef.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }
  }, [])

  useEffect(() => {
    getSimplificationSessions().then((rows) => {
      const mapped = rows.map((r) => ({
        id: r.id,
        originalPreview: r.original_text.trim().slice(0, 40),
        originalText: r.original_text,
        simplifiedText: r.simplified_text,
        glossary: r.glossary,
        idlScore: r.idl_score,
        metrics: r.metrics,
        level: r.level as Level,
        createdAt: new Date(r.created_at).getTime(),
        questions: r.questions,
      }))
      setHistory(mapped)
      setLoadingHistory(false)
      if (mapped.length > 0) {
        const first = mapped[0]
        skipAnimationRef.current = true
        setResultData({
          simplified_text: first.simplifiedText,
          glossary: first.glossary,
          idl_score: first.idlScore,
          metrics: first.metrics,
        })
        setActiveHistoryId(first.id)
        setPhase("result")
        setQuestions(first.questions ?? [])
        setAnswers(new Array((first.questions ?? []).length).fill(null))
      }
    })
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftStorageKey)
      if (saved) setText(saved)
    } catch {}
  }, [draftStorageKey])

  useEffect(() => {
    try {
      localStorage.setItem(draftStorageKey, text)
    } catch {}
  }, [draftStorageKey, text])

  useEffect(() => {
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current)
    if (!resultData) {
      setDisplayedText("")
      return
    }
    const full = resultData.simplified_text
    if (skipAnimationRef.current) {
      skipAnimationRef.current = false
      setDisplayedText(full)
      return
    }
    let pos = 0
    setDisplayedText("")
    function tick() {
      pos = Math.min(pos + 5, full.length)
      setDisplayedText(full.slice(0, pos))
      if (pos < full.length) {
        revealTimerRef.current = setTimeout(tick, 18)
      }
    }
    revealTimerRef.current = setTimeout(tick, 80)
    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current)
    }
  }, [resultData])

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
  const availableLevels = LEVELS.filter((l) => originalIdl === null || l.max < originalIdl)
  const noLevelsAvailable = originalIdl !== null && availableLevels.length === 0
  const selectedLevel = LEVELS.find((l) => l.value === level)!

  function addToHistory(entry: RecentEntry) {
    setHistory((prev) => [entry, ...prev].slice(0, 20))
  }

  function updateHistoryQuestions(id: string, qs: Question[]) {
    setHistory((prev) => prev.map((e) => e.id === id ? { ...e, questions: qs } : e))
    updateSessionQuestions(id, qs)
  }

  function handleClearAll() {
    setText("")
    setResultData(null)
    setError(null)
    setPhase("input")
    setOriginalIdl(null)
    setActiveHistoryId(null)
    setQuestions([])
    try {
      localStorage.removeItem(draftStorageKey)
    } catch {}
    setClearModalOpen(false)
  }

  function handleNewSimplification() {
    window.speechSynthesis?.cancel()
    setIsPlaying(false)
    setText("")
    setResultData(null)
    setError(null)
    setPhase("input")
    setOriginalIdl(null)
    setActiveHistoryId(null)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setAnswers([])
    setQuestionsPhase("playing")
    setMobileTab("simplificador")
    try { localStorage.removeItem(draftStorageKey) } catch {}
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  function handleToggleAudio() {
    if (!resultData) return
    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(resultData.simplified_text)
    utterance.lang = "es-AR"
    utterance.rate = 0.70
    utterance.pitch = 1
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setIsPlaying(true)
  }

  function handleCopy() {
    if (!resultData) return
    navigator.clipboard.writeText(resultData.simplified_text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleLoadHistoryEntry(entry: RecentEntry) {
    skipAnimationRef.current = true
    setResultData({
      simplified_text: entry.simplifiedText,
      glossary: entry.glossary,
      idl_score: entry.idlScore,
      metrics: entry.metrics,
    })
    setActiveHistoryId(entry.id)
    setPhase("result")
    setQuestions(entry.questions ?? [])
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setAnswers(new Array((entry.questions ?? []).length).fill(null))
    setQuestionsPhase("playing")
    setMobileTab("simplificador")
    setHistoryPanelOpen(false)
  }

  async function handleGenerateQuestions() {
    const sourceText = resultData?.simplified_text ?? text
    if (!sourceText.trim()) return
    setGeneratingQuestions(true)
    setQuestionsError(null)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    const res = await generateQuestions(sourceText, level, questionCount)
    if (res.success) {
      setQuestions(res.questions)
      setAnswers(new Array(res.questions.length).fill(null))
      setQuestionsPhase("playing")
      if (activeHistoryId) updateHistoryQuestions(activeHistoryId, res.questions)
      setQuestionsUsageToday(res.usage_today)
      setQuestionsLimit(res.daily_limit)
    } else {
      if (res.usage_today !== undefined) setQuestionsUsageToday(res.usage_today)
      if (res.daily_limit !== undefined) setQuestionsLimit(res.daily_limit)
      if (res.error !== "limit_reached") setQuestionsError(res.error)
    }
    setGeneratingQuestions(false)
  }

  async function handleFileExtract(file: File) {
    setUploadLoading(true)
    setUploadError(null)
    const formData = new FormData()
    formData.append("file", file)
    const result = await extractDocumentAction(formData)
    setUploadLoading(false)
    if (result.success) {
      setText(result.text)
      setInputMode("write")
      setExtractionNotice(result.extractionMethod)
    } else if (result.code === "EXCEEDS_LIMIT") {
      setUploadError({ type: "limit", message: result.message })
    } else {
      setUploadError({ type: "error", message: "No se pudo procesar el archivo. Intentá de nuevo." })
    }
  }

function handleSimplify() {
    if (submitLockRef.current || cooldownActive || isPending || !text.trim() || overLimit || limitReached || noLevelsAvailable) {
      return
    }

    submitLockRef.current = true
    setCooldownUntil(Date.now() + BUTTON_COOLDOWN_MS)
    setError(null)
    setResultData(null)
    setPhase("result")
    setQuestions([])
    setGlossaryOpen(false)

    startTransition(async () => {
      try {
        const res: SimplifyResult = await simplifyText(text, level)
        if (res.success) {
          const nextResult: ResultData = {
            simplified_text: res.simplified_text,
            glossary: res.glossary ?? [],
            idl_score: res.idl_score,
            metrics: res.metrics,
          }
          setResultData(nextResult)
          if (res.usage_today !== undefined) setUsageToday(res.usage_today)
          if (res.daily_limit !== undefined) setDailyLimit(res.daily_limit)

          const savedId = await saveSimplificationSession({
            original_text: text,
            simplified_text: res.simplified_text,
            level,
            idl_score: res.idl_score,
            glossary: res.glossary ?? [],
            metrics: res.metrics,
          })
          const newEntry: RecentEntry = {
            id: savedId ?? crypto.randomUUID(),
            originalPreview: text.trim().slice(0, 40),
            originalText: text,
            simplifiedText: res.simplified_text,
            glossary: res.glossary ?? [],
            idlScore: res.idl_score,
            metrics: res.metrics,
            level,
            createdAt: Date.now(),
          }
          setActiveHistoryId(newEntry.id)
          addToHistory(newEntry)
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
      className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-background lg:flex-row"
      style={{
        left: isLg ? "var(--sidebar-width, 56px)" : 0,
        transition: "left 0.35s cubic-bezier(0.33, 1, 0.68, 1)",
      }}
    >

      <div className="lg:hidden shrink-0 border-b border-border/40 bg-background">
        <div className="flex items-center justify-center px-4 py-2.5">
          <button
            type="button"
            onClick={handleNewSimplification}
            className="flex items-center justify-center gap-2 rounded-xl px-10 py-1 text-[12px] font-semibold text-white transition-all active:scale-95 cursor-pointer shadow-sm"
            style={{ backgroundColor: "#2E85C8" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="M12 5v14" />
            </svg>
            Nuevo texto
          </button>
        </div>
        <div className="flex">
          {([
            { id: "recientes", label: "Recientes" },
            { id: "simplificador", label: "Texto" },
            { id: "preguntas", label: "Preguntas" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobileTab(tab.id)}
              className={cn(
                "flex-1 py-2 text-[11px] font-medium transition-colors",
                mobileTab === tab.id
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <aside className={cn(
        "shrink-0 flex flex-col border-r border-border/50 bg-muted/30 overflow-hidden",
        mobileTab === "recientes" ? "flex w-full" : "hidden",
        historyPanelOpen ? "lg:flex lg:w-50" : "lg:hidden"
      )}>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-4 pt-3 pb-2">Recientes</p>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {loadingHistory ? (
            <div className="space-y-1 px-2 pt-2">
              <div className="animate-pulse h-10 rounded-lg bg-muted" />
              <div className="animate-pulse h-10 rounded-lg bg-muted" />
              <div className="animate-pulse h-10 rounded-lg bg-muted" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-[11px] text-muted-foreground/40 px-2 py-2">Sin historial aún</p>
          ) : (
            history.map((entry) => (
              <HistoryCard
                key={entry.id}
                entry={entry}
                active={activeHistoryId === entry.id}
                onLoad={() => handleLoadHistoryEntry(entry)}
              />
            ))
          )}
        </div>
      </aside>

      <main className={cn("flex-1 flex flex-col overflow-hidden", mobileTab !== "simplificador" ? "hidden lg:flex" : "flex")}>
        <div className={cn("shrink-0 relative flex items-center justify-between px-6 py-3.5 border-b border-border/40", phase === "result" && "hidden lg:flex")}>
          <div className="hidden lg:flex items-center">
            {historyPanelOpen ? (
              <button
                type="button"
                onClick={() => setHistoryPanelOpen(false)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border/50 bg-background hover:bg-accent text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Ocultar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setHistoryPanelOpen(true)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border/50 bg-background hover:bg-accent text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Recientes
              </button>
            )}
          </div>
          <p className="hidden lg:block absolute left-1/2 -translate-x-1/2 text-[13px] text-muted-foreground/70 pointer-events-none">Adaptá textos al nivel de lectura adecuado</p>
          <div className="flex items-center gap-2 lg:ml-0 ml-auto">
            {phase === "input" && inputMode === "write" && (
              <div className="hidden lg:flex">
                <LevelDropdown value={level} onChange={setLevel} originalIdl={originalIdl} direction="down" />
              </div>
            )}
            {phase === "result" && !isPending && resultData && (
              <button
                type="button"
                onClick={handleCopy}
                className="hidden lg:flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border/50 bg-background hover:bg-accent text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
                {copied ? "Copiado" : "Copiar"}
              </button>
            )}
            {phase === "result" && !isPending && resultData && (
              <button
                type="button"
                onClick={() => setPdfModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border/50 bg-background hover:bg-accent text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                Exportar PDF
              </button>
            )}
            {phase === "result" && !isPending && (
              <div className="hidden lg:flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className="flex items-center justify-center h-8 w-8 rounded-lg border border-border/50 bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title={isPlaying ? "Pausar audio" : "Escuchar texto"}
                >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleNewSimplification}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-white transition-colors cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: "#2E85C8" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="M12 5v14" />
                  </svg>
                  Nueva simplificación
                </button>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === "input" ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col overflow-hidden lg:p-6 lg:gap-4"
            >
              {limitReached && mode === "patient" && (
                <div className="rounded-2xl border border-border/60 bg-card/95 px-4 py-4 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.35)] sm:px-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">Alcanzaste el límite diario</p>
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

              <div className="shrink-0 flex items-center gap-3 px-4 pt-3 lg:px-10 lg:pt-5">
                <div className="inline-flex rounded-lg border border-border/50 bg-muted/40 p-0.5">
                  <button
                    type="button"
                    onClick={() => { setInputMode("write"); setUploadError(null) }}
                    className={cn(
                      "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                      inputMode === "write" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Escribir texto
                  </button>
                  <button
                    type="button"
                    onClick={() => { setInputMode("upload"); setUploadError(null) }}
                    className={cn(
                      "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                      inputMode === "upload" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Subir archivo
                  </button>
                </div>
              </div>

              {extractionNotice && inputMode === "write" && (
                <div className="shrink-0 mx-4 lg:mx-10 mt-3 flex items-center justify-between gap-2">
                  <span className={cn(
                    "text-[11px] flex items-center gap-1.5",
                    extractionNotice === "vision" ? "text-amber-500" : "text-green-600"
                  )}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {extractionNotice === "vision"
                        ? <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        : <polyline points="20 6 9 17 4 12"/>}
                    </svg>
                    {extractionNotice === "vision"
                      ? "Extraído con IA — revisá el contenido antes de continuar"
                      : "Texto extraído correctamente"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExtractionNotice(null)}
                    className="text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {inputMode === "write" ? (
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    mode === "admin"
                      ? "Pegá o escribí el texto que querés transformar..."
                      : "Pegá o escribí el texto que querés simplificar..."
                  }
                  disabled={limitReached && mode === "patient"}
                  className="flex-1 resize-none bg-transparent px-10 py-8 text-base leading-relaxed focus:outline-none placeholder:text-muted-foreground/30 disabled:opacity-50 lg:text-3xl lg:leading-[1.8] font-light"
                />
              ) : (
                <div className="flex-1 flex flex-col gap-3 px-4 py-4 lg:px-10 lg:py-6 min-h-0">
                  {uploadError && (
                    <div className={cn(
                      "shrink-0 rounded-xl border px-4 py-3 text-xs leading-relaxed",
                      uploadError.type === "error"
                        ? "border-red-400/40 bg-red-400/8 text-red-600"
                        : "border-amber-400/40 bg-amber-400/8 text-amber-700"
                    )}>
                      {uploadError.message}
                    </div>
                  )}
                  <label
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition-colors cursor-pointer",
                      uploadLoading
                        ? "border-border/40 bg-muted/20 cursor-default"
                        : isDragging
                          ? "border-[#2E85C8] bg-[#2E85C8]/5"
                          : "border-border/40 hover:border-border/70 bg-muted/20 hover:bg-muted/30"
                    )}
                    onDragOver={(e) => { e.preventDefault(); if (!uploadLoading) setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setIsDragging(false)
                      if (uploadLoading) return
                      const file = e.dataTransfer.files[0]
                      if (file) handleFileExtract(file)
                    }}
                  >
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className="sr-only"
                      disabled={uploadLoading}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileExtract(file)
                        e.target.value = ""
                      }}
                    />
                    {uploadLoading ? (
                      <>
                        <svg className="h-5 w-5 animate-spin text-[#2E85C8]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="text-sm text-muted-foreground">Procesando archivo...</p>
                      </>
                    ) : (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-background">
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60">
                            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" x2="12" y1="18" y2="12" />
                            <line x1="9" x2="15" y1="15" y2="15" />
                          </svg>
                        </div>
                        <div className="text-center space-y-1.5">
                          <p className="text-sm font-medium text-foreground">
                            {isDragging ? "Soltá el archivo aquí" : "Arrastrá un archivo o hacé clic para seleccionar"}
                          </p>
                          <p className="text-xs text-muted-foreground/60">PDF, DOCX o TXT · Máximo 10 MB</p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
              )}

              <div className={cn("shrink-0 flex items-center justify-between border-t border-border/40 px-4 py-3 lg:border-0 lg:px-0 lg:py-0", inputMode === "upload" && "hidden")}>
                <div className="flex items-center gap-3">
                  <div className="lg:hidden">
                    <LevelDropdown value={level} onChange={setLevel} originalIdl={originalIdl} direction="up" />
                  </div>
                  <span className={cn("text-[10px] tabular-nums", overLimit ? "font-semibold text-red-500" : "text-muted-foreground/50")}>
                    {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {text.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => setClearModalOpen(true)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-md border border-red-500 bg-transparent px-2 py-1 text-[11px] font-medium text-red-500 transition-colors hover:bg-red-500/8"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                      Limpiar
                    </button>
                  )}
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

              <div className={cn("hidden shrink-0 justify-end", inputMode === "write" && "lg:flex")}>
                {mode === "admin" ? (
                  <span className={cn("text-[11px] tabular-nums", limitReached ? "font-semibold text-red-500" : "text-muted-foreground/55")}>
                    {usageToday ?? 0}/{dailyLimit} hoy
                  </span>
                ) : usageToday !== null ? (
                  <span className="text-[11px] tabular-nums text-muted-foreground/60">{usageToday}/{dailyLimit} hoy</span>
                ) : null}
              </div>

            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col overflow-hidden relative"
            >
              <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4 lg:px-12 lg:py-10">
                {isPending ? (
                  <TypewriterLoading />
                ) : error ? (
                  <p className="text-sm font-light leading-relaxed text-red-500">{error}</p>
                ) : resultData ? (
                  <>
                    <AnnotatedText text={displayedText} glossary={resultData.glossary} />
                    {resultData.glossary.length > 0 && (
                      <div className="hidden lg:block mt-6 border-t border-border/40 pt-4">
                        <p className="mb-3 text-base sm:text-lg lg:text-xl font-medium text-muted-foreground">Palabras difíciles</p>
                        <div className="space-y-3">
                          {resultData.glossary.map((entry) => (
                            <div key={entry.term}>
                              <span className="text-lg sm:text-xl lg:text-2xl font-medium text-[#2E85C8]">{entry.term}</span>
                              <span className="text-lg sm:text-xl lg:text-2xl font-light text-muted-foreground leading-relaxed"> — {entry.definition}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>

              {!isPending && resultData && (
                <div className="hidden lg:flex shrink-0 items-center gap-2 px-6 py-2.5 border-t border-border/40 bg-muted/20">
                  <span className="text-[11px] px-2.5 py-1 rounded-md border border-border/40 bg-background text-muted-foreground">
                    IDL {resultData.idl_score.toFixed(1)}
                  </span>
                  <span className="text-[11px] px-2.5 py-1 rounded-md border border-border/40 bg-background text-muted-foreground">
                    {selectedLevel.label}
                  </span>
                  <span className="text-[11px] px-2.5 py-1 rounded-md border border-border/40 bg-background text-muted-foreground">
                    {resultData.simplified_text.split(/\s+/).filter(Boolean).length} palabras
                  </span>
                  <button
                    type="button"
                    onClick={() => setMetricsOpen(true)}
                    className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-white cursor-pointer transition-opacity hover:opacity-85"
                    style={{ backgroundColor: "#2E85C8" }}
                  >
                    Ver métricas
                  </button>
                </div>
              )}

              {!isPending && resultData && (
                <div className="lg:hidden shrink-0 flex items-center justify-between px-4 py-3 border-t border-border/40 bg-background">
                  {resultData.glossary.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setGlossaryOpen(true)}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m18 15-6-6-6 6"/>
                      </svg>
                      Ver palabras difíciles
                    </button>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-background hover:bg-accent px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      )}
                      {copied ? "Copiado" : "Copiar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfModalOpen(true)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Exportar PDF"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleAudio}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title={isPlaying ? "Pausar audio" : "Escuchar texto"}
                    >
                      {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {glossaryOpen && resultData && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/20 lg:hidden"
                      onClick={() => setGlossaryOpen(false)}
                    />
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute inset-x-0 bottom-0 z-10 rounded-t-2xl border-t border-border/60 bg-card lg:hidden"
                    >
                      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                        <p className="text-sm font-medium">Palabras difíciles</p>
                        <button
                          type="button"
                          onClick={() => setGlossaryOpen(false)}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6"/>
                          </svg>
                        </button>
                      </div>
                      <div className="overflow-y-auto max-h-72 px-5 py-4 space-y-3">
                        {resultData.glossary.map((entry) => (
                          <div key={entry.term}>
                            <span className="text-sm font-medium text-[#2E85C8]">{entry.term}</span>
                            <span className="text-sm text-muted-foreground"> — {entry.definition}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <aside
        className={cn("relative shrink-0 flex flex-col border-l border-border/50 bg-muted/30 overflow-hidden lg:flex", mobileTab !== "preguntas" ? "hidden lg:flex" : "flex flex-1 w-full")}
        style={mobileTab === "preguntas" ? undefined : { width: questionsWidth }}
      >
        <div
          className="hidden lg:flex absolute left-0 top-0 bottom-0 w-3 cursor-col-resize items-center justify-center group z-10"
          onMouseDown={(e) => {
            questionsResizingRef.current = true
            questionsResizeStartRef.current = { x: e.clientX, width: questionsWidth }
            document.body.style.cursor = "col-resize"
            document.body.style.userSelect = "none"
          }}
        >
          <div className="w-px h-full bg-border/30 group-hover:bg-border/60 transition-colors" />
          <div className="absolute flex items-center justify-center bg-background border border-border/50 rounded-full w-4 h-4 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </div>
        </div>
        <div className="shrink-0 flex items-center justify-between px-4 pr-5 py-3.5 border-b border-border/40">
          <span className="text-sm font-medium text-foreground/80">Cantidad de preguntas</span>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="text-sm rounded-lg border border-border/50 bg-background px-3 py-1.5 focus:outline-none text-foreground cursor-pointer"
          >
            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
              <option key={n} value={n}>{n} preguntas</option>
            ))}
          </select>
        </div>

        {mode === "patient" && questionsLimit > 0 && questionsUsageToday >= questionsLimit ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Límite diario alcanzado</p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Usaste tus {questionsLimit} generaciones de hoy. Volvé mañana o mejorá tu plan.
              </p>
            </div>
            <Link
              href="/planes"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#2E85C8" }}
            >
              Cambiar plan
            </Link>
            <p className="text-[10px] text-muted-foreground/50">{questionsUsageToday}/{questionsLimit} hoy</p>
          </div>
        ) : !text.trim() && !resultData ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4 text-center">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground/40 text-sm font-medium">?</div>
            <p className="text-xs font-medium text-muted-foreground">Sin preguntas aún</p>
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed">Ingresá un texto para generar preguntas de comprensión</p>
          </div>
        ) : generatingQuestions ? (
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            <div className="animate-pulse rounded-lg bg-muted h-14" />
            <div className="animate-pulse rounded-lg bg-muted h-14" />
            <div className="animate-pulse rounded-lg bg-muted h-14" />
          </div>
        ) : questions.length > 0 ? (
          questionsPhase === "finished" ? (
            <QuestionsResult
              correct={questions.filter((q, i) => answers[i] === q.correct_index).length}
              total={questions.length}
              onRetry={() => {
                setCurrentQuestionIndex(0)
                setSelectedAnswer(null)
                setShowResult(false)
                setAnswers(new Array(questions.length).fill(null))
                setQuestionsPhase("playing")
              }}
            />
          ) : (
          <div className="flex-1 overflow-hidden px-3 py-3 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex flex-col flex-1"
              >
                <p className="text-xs uppercase tracking-wide text-muted-foreground/60">
                  Pregunta {currentQuestionIndex + 1} de {questions.length}
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-muted/60">
                  <div
                    className="h-1.5 rounded-full bg-[#2E85C8] transition-all"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
                <p className="mt-4 mb-5 text-md font-medium leading-relaxed text-foreground">
                  {questions[currentQuestionIndex].question}
                </p>
                <div className="space-y-2.5">
                  {questions[currentQuestionIndex].options.map((option, i) => {
                    const correct = questions[currentQuestionIndex].correct_index
                    let cls = "border-border/50 bg-background hover:bg-accent hover:border-border text-foreground/80"
                    if (showResult) {
                      if (i === correct) {
                        cls = selectedAnswer === i
                          ? "border-green-500/60 bg-green-500/10 text-green-700"
                          : "border-green-500/40 bg-green-500/6 text-green-600"
                      } else if (i === selectedAnswer) {
                        cls = "border-red-400/60 bg-red-400/10 text-red-600"
                      }
                    }
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={showResult}
                        onClick={() => {
                          setSelectedAnswer(i)
                          setShowResult(true)
                          setAnswers((prev) => { const next = [...prev]; next[currentQuestionIndex] = i; return next })
                        }}
                        className={cn("w-full text-left rounded-xl border px-4 py-3 text-sm leading-relaxed transition-all cursor-pointer disabled:cursor-default", cls)}
                      >
                        <span className="mr-2 font-semibold">{["A", "B", "C", "D"][i]}.</span>
                        {option}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-5 flex items-center justify-between">
                  {currentQuestionIndex > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        const newIdx = currentQuestionIndex - 1
                        setCurrentQuestionIndex(newIdx)
                        const saved = answers[newIdx]
                        setSelectedAnswer(saved ?? null)
                        setShowResult(saved !== null && saved !== undefined)
                      }}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                      Anterior
                    </button>
                  ) : (
                    <span />
                  )}
                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      disabled={!showResult}
                      onClick={() => {
                        const newIdx = currentQuestionIndex + 1
                        setCurrentQuestionIndex(newIdx)
                        const saved = answers[newIdx]
                        setSelectedAnswer(saved ?? null)
                        setShowResult(saved !== null && saved !== undefined)
                      }}
                      className="flex items-center gap-1 text-sm font-medium text-[#2E85C8] disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      Siguiente
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!showResult}
                      onClick={() => setQuestionsPhase("finished")}
                      className="text-sm font-medium text-[#2E85C8] disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      Finalizar
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          )
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
            {questionsError && (
              <p className="text-[11px] text-red-500 text-center">{questionsError}</p>
            )}
            <button
              type="button"
              onClick={handleGenerateQuestions}
              disabled={(!text.trim() && !resultData) || generatingQuestions || isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              style={{ backgroundColor: "#2E85C8" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                <path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" />
              </svg>
              {questionsError ? "Reintentar" : "Generar preguntas"}
            </button>
          </div>
        )}

        <div className="shrink-0 px-3 py-3 border-t border-border/40 space-y-2">
          {questions.length > 0 && questionsPhase === "playing" && (
            <button
              type="button"
              onClick={handleGenerateQuestions}
              disabled={(!text.trim() && !resultData) || generatingQuestions || isPending}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              style={{ backgroundColor: "#2E85C8" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
              Regenerar preguntas
            </button>
          )}
          <div className="flex items-center justify-center">
            <span className="text-xs tabular-nums text-muted-foreground">{questionsUsageToday}/{questionsLimit} generaciones hoy</span>
          </div>
        </div>
      </aside>

      {mounted && metricsOpen && resultData && createPortal(
        <>
          <div className="fixed inset-0 z-70 bg-black/50 backdrop-blur-sm" onClick={() => setMetricsOpen(false)} />
          <div className="fixed inset-x-3 top-1/2 z-75 -translate-y-1/2 rounded-2xl border border-border/60 bg-card p-6 shadow-2xl sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[460px]">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-base font-semibold text-foreground">Métricas del texto</p>
                <p className="text-xs text-muted-foreground mt-0.5">Análisis del texto simplificado</p>
              </div>
              <button
                type="button"
                onClick={() => setMetricsOpen(false)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <MetricsCard metrics={resultData.metrics} />
          </div>
        </>,
        document.body
      )}

      {mounted && clearModalOpen && createPortal(
        <div
          className="fixed inset-0 z-80 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setClearModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border/60 bg-white p-6 shadow-2xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-1 text-sm font-semibold text-foreground">¿Eliminar contenido?</p>
            <p className="mb-5 text-xs font-light leading-relaxed text-muted-foreground">
              Se eliminará el texto ingresado{resultData !== null ? " y el resultado de la simplificación" : ""}.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setClearModalOpen(false)}
                className="flex h-9 w-full cursor-pointer items-center justify-center rounded-xl border border-border/60 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="flex h-9 w-full cursor-pointer items-center justify-center rounded-xl bg-red-500 text-xs font-medium text-white transition-colors hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {mounted && pdfModalOpen && resultData && (
        <SimplifierPdfModal
          resultData={resultData}
          questions={questions}
          level={level}
          onClose={() => setPdfModalOpen(false)}
        />
      )}
    </div>
  )
}
