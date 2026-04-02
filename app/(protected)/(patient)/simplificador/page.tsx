"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { simplifyText, getSimplificationUsage } from "@/lib/actions/simplify-text"
import { TypewriterLoading } from "@/components/typewriter-loading"

type Level = "muy_facil" | "facil" | "medio" | "dificil"

const LEVELS: { value: Level; label: string; idl: string }[] = [
  { value: "muy_facil", label: "Muy fácil", idl: "IDL 0–20" },
  { value: "facil",     label: "Fácil",     idl: "IDL 20–40" },
  { value: "medio",     label: "Medio",     idl: "IDL 40–60" },
  { value: "dificil",   label: "Difícil",   idl: "IDL 60–80" },
]

const MAX_CHARS = 5000


function LevelDropdown({ value, onChange }: { value: Level; onChange: (v: Level) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = LEVELS.find((l) => l.value === value)!

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-background/40 px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-accent transition-colors focus:outline-none whitespace-nowrap cursor-pointer w-36 sm:w-44"
      >
        <span className="flex items-center gap-1.5">
          <span>{selected.label}</span>
          <span className="text-muted-foreground font-normal">{selected.idl}</span>
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={cn("opacity-40 transition-transform shrink-0", open && "rotate-180")}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full mb-1.5 right-0 z-50 min-w-[11rem] rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
          {LEVELS.map((l) => (
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

export default function SimplificadorPagePatient() {
  const [text, setText] = useState("")
  const [level, setLevel] = useState<Level>("facil")
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [usageToday, setUsageToday] = useState<number | null>(null)
  const [dailyLimit, setDailyLimit] = useState(5)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getSimplificationUsage().then(({ usage_today, daily_limit }) => {
      setUsageToday(usage_today)
      setDailyLimit(daily_limit)
    })
  }, [])

  const charCount = text.length
  const overLimit = charCount > MAX_CHARS
  const limitReached = usageToday !== null && usageToday >= dailyLimit

  function handleSimplify() {
    setError(null)
    setResult(null)
    startTransition(async () => {
      const res = await simplifyText(text, level)
      if (res.success && res.simplified_text) {
        setResult(res.simplified_text)
        if (res.usage_today !== undefined) setUsageToday(res.usage_today)
      } else {
        setError(res.error ?? "Error desconocido.")
        if (res.usage_today !== undefined) setUsageToday(res.usage_today)
      }
    })
  }

  function handleCopy() {
    if (!result) return
    navigator.clipboard.writeText(result).then(() => {
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
              <LevelDropdown value={level} onChange={setLevel} />
              <button
                type="button"
                onClick={handleSimplify}
                disabled={isPending || overLimit || limitReached || !text.trim()}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer text-white hover:opacity-90 active:scale-95",
                  !text.trim() || overLimit || limitReached ? "opacity-40" : "opacity-100"
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

        {(isPending || result || error) && (
          <div
            className="rounded-xl border border-border/60 bg-card overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.08)" }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
              <p className="text-xs font-light tracking-wide text-muted-foreground">Texto simplificado</p>
              {result && (
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
              <TypewriterLoading />
            ) : error ? (
              <p className="p-5 text-sm font-light text-red-500">{error}</p>
            ) : (
              <p className="p-5 text-sm font-light leading-relaxed whitespace-pre-wrap tracking-wide">{result}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
