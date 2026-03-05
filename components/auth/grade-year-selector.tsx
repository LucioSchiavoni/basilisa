"use client"

import { useState } from "react"
import { Check, ArrowRight } from "lucide-react"

const GRADES = [
  { year: 1, color: "#C73341" },
  { year: 2, color: "#579F93" },
  { year: 3, color: "#D3A021" },
  { year: 4, color: "#2E85C8" },
  { year: 5, color: "#C73341" },
  { year: 6, color: "#579F93" },
]

interface GradeYearSelectorProps {
  onSelect: (gradeYear: number) => void
}

export function GradeYearSelector({ onSelect }: GradeYearSelectorProps) {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-6 gap-2">
        {GRADES.map((g) => {
          const isSelected = selected === g.year
          return (
            <button
              key={g.year}
              type="button"
              onClick={() => setSelected(isSelected ? null : g.year)}
              className="relative flex flex-col items-center justify-center gap-1 rounded-2xl border-2 py-4 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                borderColor: isSelected ? g.color : "transparent",
                backgroundColor: isSelected ? g.color + "14" : "rgba(255,255,255,0.75)",
                boxShadow: isSelected ? `0 4px 16px ${g.color}28` : "0 1px 4px rgba(0,0,0,0.07)",
              }}
            >
              {isSelected && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: g.color }}
                >
                  <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                </div>
              )}
              <span
                className="text-2xl font-bold transition-colors duration-200"
                style={{ color: isSelected ? g.color : "#6b7280" }}
              >
                {g.year}°
              </span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => selected !== null && onSelect(selected)}
        disabled={selected === null}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-semibold text-white bg-[#579F93] hover:bg-[#4a8e83] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        Continuar
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}
