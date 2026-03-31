"use client"

import { useState, useTransition } from "react"
import { confirmGradeYear } from "./actions"
import { FloatingParticles } from "@/components/home/floating-particles"
import { LisaLogo } from "@/components/svg/lisa-logo"
import { GradeYearSelector } from "@/components/auth/grade-year-selector"

export function GradeReviewClient({ gradeYear }: { gradeYear: number }) {
  const [showSelector, setShowSelector] = useState(false)
  const [isPending, startTransition] = useTransition()

  const nextGrade = Math.min(gradeYear + 1, 6)
  const isAlreadyMax = gradeYear >= 6

  function handleConfirm(newGrade: number) {
    startTransition(async () => {
      await confirmGradeYear(newGrade)
    })
  }

  return (
    <div
      className="theme-fixed-light min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          "#ffffff",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 78%, rgba(251,222,200,0.35) 0%, transparent 52%), radial-gradient(circle at 82% 18%, rgba(248,216,190,0.28) 0%, transparent 48%), radial-gradient(circle at 55% 90%, rgba(253,230,210,0.22) 0%, transparent 40%)",
        }}
      />
      <FloatingParticles />

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-8 -mt-12">
        <LisaLogo className="w-24 h-auto select-none" />

        <div
          className="w-full rounded-3xl shadow-xl p-8"
          style={{ backgroundColor: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)" }}
        >
          <div className="flex flex-col gap-7">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold text-neutral-800">
                ¡Comenzó un nuevo año escolar!
              </h1>
              <p className="text-sm text-neutral-500">
                {isAlreadyMax
                  ? `¿Seguís cursando ${gradeYear}° este año?`
                  : `¿Estás cursando ${nextGrade}° ahora?`}
              </p>
            </div>

            {isPending ? (
              <div className="flex items-center justify-center py-8">
                <span className="h-6 w-6 border-2 border-[#579F93]/30 border-t-[#579F93] rounded-full animate-spin" />
              </div>
            ) : showSelector ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-center text-neutral-600">Elegí tu año actual:</p>
                <GradeYearSelector onSelect={handleConfirm} />
                <button
                  type="button"
                  onClick={() => setShowSelector(false)}
                  className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  Volver
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {!isAlreadyMax && (
                  <button
                    type="button"
                    onClick={() => handleConfirm(nextGrade)}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-semibold text-white bg-[#579F93] hover:bg-[#4a8e83] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    Si, estoy en {nextGrade}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleConfirm(gradeYear)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-semibold border-2 border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  {isAlreadyMax ? `Si, sigo en ${gradeYear}°` : `No, sigo en ${gradeYear}°`}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSelector(true)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  Estoy en otro grado
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
