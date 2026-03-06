"use client"

import { useEffect, useRef, useState, useActionState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Check, Calendar } from "lucide-react"
import { saveDateOfBirth } from "./actions"
import { LisaLogo } from "@/components/svg/lisa-logo"

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]
const WEEK_DAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"]

type Selected = { year: number; month: number; day: number }

function getFirstWeekDay(year: number, month: number) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

export function OnboardingClient() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(saveDateOfBirth, {})

  const currentYear = new Date().getFullYear()
  const [viewYear, setViewYear] = useState(2005)
  const [viewMonth, setViewMonth] = useState(5)
  const [selected, setSelected] = useState<Selected | null>(null)
  const [showYearPicker, setShowYearPicker] = useState(false)
  const yearPickerRef = useRef<HTMLDivElement>(null)
  const selectedYearRef = useRef<HTMLButtonElement>(null)

  const yearRange = Array.from({ length: currentYear - 1949 }, (_, i) => 1950 + i).reverse()

  useEffect(() => {
    if (showYearPicker && selectedYearRef.current && yearPickerRef.current) {
      const container = yearPickerRef.current
      const el = selectedYearRef.current
      const offset = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2
      container.scrollTop = offset
    }
  }, [showYearPicker])

  useEffect(() => {
    if (state?.success) router.push("/ejercicios")
  }, [state?.success, router])

  const firstDay = getFirstWeekDay(viewYear, viewMonth)
  const daysInMonth = getDaysInMonth(viewYear, viewMonth)

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
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
    <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6">
      <LisaLogo className="w-20 h-auto select-none" />

      <div className="w-full rounded-3xl bg-white/85 backdrop-blur-xl shadow-xl border border-white/60 overflow-hidden">
        <div className="px-5 pt-5 pb-3 space-y-1">
          <h1 className="text-lg font-semibold text-neutral-800">¿Cuándo naciste?</h1>
          <p className="text-xs text-neutral-500">Seleccioná tu fecha de nacimiento</p>
        </div>

        <div className="px-4 pb-5">
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
                    <div key={d} className="text-center text-[10px] font-semibold text-neutral-800 dark:text-white py-1">
                      {d}
                    </div>
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
            <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#579F93]/10 border border-[#579F93]/20">
              <Check className="h-3.5 w-3.5 text-[#579F93] shrink-0" />
              <span className="text-sm text-[#579F93] font-medium">{selectedLabel}</span>
            </div>
          )}

          <form action={formAction} className="mt-4 mb-2">
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

          <button
            type="button"
            onClick={() => router.replace("/ejercicios")}
            className="w-full py-2.5 rounded-2xl text-sm font-medium text-neutral-500 border border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 transition-all duration-200"
          >
            Completar luego
          </button>
        </div>
      </div>
    </div>
  )
}
