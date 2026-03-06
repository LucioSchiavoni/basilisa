"use client"

import { useState, useEffect, useRef, useActionState } from "react"
import { X, Calendar, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { saveDateOfBirth } from "@/app/(protected)/ejercicios/onboarding/actions"
import { useRouter } from "next/navigation"

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
const WEEK_DAYS = ["Lu","Ma","Mi","Ju","Vi","Sá","Do"]

function getFirstWeekDay(year: number, month: number) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

export function DobReminderBanner() {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(saveDateOfBirth, {})

  const currentYear = new Date().getFullYear()
  const [viewYear, setViewYear] = useState(2005)
  const [viewMonth, setViewMonth] = useState(5)
  const [selected, setSelected] = useState<{ year: number; month: number; day: number } | null>(null)
  const [showYearPicker, setShowYearPicker] = useState(false)
  const yearPickerRef = useRef<HTMLDivElement>(null)
  const selectedYearRef = useRef<HTMLButtonElement>(null)

  const yearRange = Array.from({ length: currentYear - 1949 }, (_, i) => 1950 + i).reverse()

  useEffect(() => {
    if (showYearPicker && selectedYearRef.current && yearPickerRef.current) {
      const container = yearPickerRef.current
      const el = selectedYearRef.current
      container.scrollTop = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2
    }
  }, [showYearPicker])

  useEffect(() => {
    if (state?.success) {
      setOpen(false)
      router.refresh()
    }
  }, [state?.success, router])

  if (dismissed) return null

  const firstDay = getFirstWeekDay(viewYear, viewMonth)
  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const isSelected = (day: number) =>
    selected?.year === viewYear && selected?.month === viewMonth && selected?.day === day

  const selectedDateStr = selected
    ? `${selected.year}-${String(selected.month + 1).padStart(2, "0")}-${String(selected.day).padStart(2, "0")}`
    : ""

  const selectedLabel = selected
    ? `${selected.day} de ${MONTHS[selected.month]} de ${selected.year}`
    : null

  return (
    <>
      <div className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-500/25 w-full lg:w-auto">
        <div className="shrink-0 w-7 h-7 rounded-xl bg-amber-200/70 dark:bg-amber-500/20 flex items-center justify-center">
          <Calendar className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-1.5 min-w-0 flex-1">
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 leading-tight">
            ¡Completá tu fecha de nacimiento!
          </span>
          <span className="hidden lg:inline text-xs text-amber-600 dark:text-amber-400/70">·</span>
          <span className="text-xs text-amber-700 dark:text-amber-400/80 leading-tight">
            Para personalizar tu experiencia
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 text-xs font-semibold text-amber-700 dark:text-amber-400 underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
        >
          Completar
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-amber-200/70 dark:hover:bg-amber-500/20 transition-colors text-amber-600 dark:text-amber-400 ml-1"
          aria-label="Cerrar aviso"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle>¿Cuándo naciste?</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
                  else setViewMonth(m => m - 1)
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-neutral-500"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowYearPicker(v => !v)}
                className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-white hover:text-[#579F93] dark:hover:text-[#579F93] transition-colors px-2 py-1 rounded-lg hover:bg-[#579F93]/8"
              >
                <Calendar className="h-3.5 w-3.5" />
                {MONTHS[viewMonth]} {viewYear}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
                  else setViewMonth(m => m + 1)
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-neutral-500"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {showYearPicker ? (
              <div ref={yearPickerRef} className="absolute inset-x-0 top-10 z-10 bg-white rounded-2xl shadow-lg border border-neutral-100 p-3 max-h-72 overflow-y-auto">
                <div className="grid grid-cols-4 gap-1.5">
                  {yearRange.map((y) => (
                    <button
                      key={y}
                      ref={y === viewYear ? selectedYearRef : undefined}
                      type="button"
                      onClick={() => { setViewYear(y); setShowYearPicker(false) }}
                      className="py-2 rounded-xl text-sm font-medium transition-all duration-150 hover:scale-105"
                      style={{
                        backgroundColor: y === viewYear ? "#579F93" : "transparent",
                        color: y === viewYear ? "white" : "#374151",
                      }}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 mb-2">
                  {WEEK_DAYS.map((d) => (
                    <div key={d} className="text-center text-[10px] font-semibold text-neutral-800 dark:text-white py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                  {cells.map((day, i) => (
                    <div key={i} className="flex items-center justify-center">
                      {day ? (
                        <button
                          type="button"
                          onClick={() => setSelected({ year: viewYear, month: viewMonth, day })}
                          className={`w-9 h-9 rounded-full text-sm font-medium transition-all duration-150 hover:scale-110 active:scale-95 ${isSelected(day) ? "text-white" : "text-neutral-800 dark:text-white"}`}
                          style={{
                            backgroundColor: isSelected(day) ? "#579F93" : "transparent",
                            boxShadow: isSelected(day) ? "0 2px 8px #579F9340" : "none",
                          }}
                        >
                          {day}
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {selectedLabel && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#579F93]/10 border border-[#579F93]/20">
              <Check className="h-3.5 w-3.5 text-[#579F93] shrink-0" />
              <span className="text-sm text-[#579F93] font-medium">{selectedLabel}</span>
            </div>
          )}

          <form action={formAction}>
            <input type="hidden" name="date_of_birth" value={selectedDateStr} />
            {state?.error && (
              <p className="text-xs text-red-500 mb-2 text-center">{state.error}</p>
            )}
            <button
              type="submit"
              disabled={!selected || pending}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold text-white bg-[#579F93] hover:bg-[#4a8e83] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {pending ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : "Confirmar fecha"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
