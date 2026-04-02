"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { simplifyText, getSimplificationUsage } from "@/lib/actions/simplify-text"
import { TypewriterLoading } from "@/components/typewriter-loading"

function ResultAside({
  result,
  error,
  isPending,
  open,
  onClose,
}: {
  result: string | null
  error: string | null
  isPending: boolean
  open: boolean
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const visible = open && (isPending || !!result || !!error)

  function handleCopy() {
    if (!result) return
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      {visible && !minimized && (
        <div
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col bg-card border-l border-border/60 transition-transform duration-300 ease-out sm:hidden",
          visible && !minimized ? "translate-x-0" : "translate-x-full"
        )}
        style={{
          boxShadow: "-4px 0 32px rgba(0,0,0,0.15)",
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 shrink-0">
          <p className="text-xs font-light tracking-wide text-muted-foreground">Texto simplificado</p>
          <div className="flex items-center gap-3">
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
            <button
              type="button"
              onClick={() => setMinimized(true)}
              className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              aria-label="Minimizar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {isPending ? (
            <TypewriterLoading />
          ) : error ? (
            <p className="text-sm font-light text-red-500 leading-relaxed">{error}</p>
          ) : (
            <p className="text-sm font-light leading-relaxed whitespace-pre-wrap tracking-wide">{result}</p>
          )}
        </div>
      </div>

      {visible && minimized && (
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="fixed bottom-24 right-0 z-50 sm:hidden flex items-center gap-2 bg-card border border-border/60 border-r-0 rounded-l-xl px-3 py-2.5 text-xs font-light text-foreground shadow-lg transition-colors hover:bg-accent cursor-pointer"
          style={{ boxShadow: "-2px 2px 12px rgba(0,0,0,0.12)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Resultado
        </button>
      )}
    </>
  )
}

type Level = "muy_facil" | "facil" | "medio" | "dificil"

const LEVELS: { value: Level; label: string; idl: string }[] = [
  { value: "muy_facil", label: "Muy fácil", idl: "IDL 0–20" },
  { value: "facil",     label: "Fácil",     idl: "IDL 20–40" },
  { value: "medio",     label: "Medio",     idl: "IDL 40–60" },
  { value: "dificil",   label: "Difícil",   idl: "IDL 60–80" },
]

const MAX_CHARS = 5000


function LevelDropdown({
  value,
  onChange,
}: {
  value: Level
  onChange: (v: Level) => void
}) {
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

      {open && (
        <div className="absolute bottom-full mb-1.5 right-0 z-50 min-w-[11rem] rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
          {LEVELS.map((l) => (
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

export default function SimplificadorPage() {
  const [text, setText] = useState("")
  const [level, setLevel] = useState<Level>("facil")
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [asideOpen, setAsideOpen] = useState(false)
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
    setAsideOpen(true)
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
    <div className="flex flex-col items-center px-4 py-6 sm:py-12 sm:min-h-[calc(100vh-8rem)] sm:justify-center">
      <ResultAside
        result={result}
        error={error}
        isPending={isPending}
        open={asideOpen}
        onClose={() => setAsideOpen(false)}
      />

      <div className="w-full max-w-3xl space-y-4">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-light tracking-widest uppercase">Simplificador de Textos</h1>
        </div>

        <div
          className="rounded-lg border border-border/60 bg-card flex flex-col"
          style={{
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.07), 0 6px 20px rgba(0,0,0,0.09), 0 20px 48px -8px rgba(0,0,0,0.14)",
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
            <LevelDropdown value={level} onChange={setLevel} />

            <button
              type="button"
              onClick={handleSimplify}
              disabled={isPending || overLimit || limitReached}
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

        {(isPending || result || error) && (
          <div
            className="hidden sm:block rounded-lg border border-border/60 bg-card overflow-hidden"
            style={{
              boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.08)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
              <p className="text-xs font-medium text-muted-foreground">Texto simplificado</p>
              {result && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
              <p className="p-5 text-sm text-red-500">{error}</p>
            ) : (
              <p className="p-5 text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
