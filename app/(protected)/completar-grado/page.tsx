"use client"

import { useTransition } from "react"
import { GradeYearSelector } from "@/components/auth/grade-year-selector"
import { saveGradeYear } from "./actions"
import { FloatingParticles } from "@/components/home/floating-particles"
import { LisaLogo } from "@/components/svg/lisa-logo"

export default function CompletarGradoPage() {
  const [isPending, startTransition] = useTransition()

  function handleSelect(year: number) {
    startTransition(async () => {
      await saveGradeYear(year)
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
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-semibold text-neutral-800">
                ¡Bienvenido! ¿En qué año estás cursando?
              </h1>
              <p className="text-sm text-neutral-500">
                Elegí tu año para personalizar tu experiencia en LISA
              </p>
            </div>

            {isPending ? (
              <div className="flex items-center justify-center py-8">
                <span className="h-6 w-6 border-2 border-[#579F93]/30 border-t-[#579F93] rounded-full animate-spin" />
              </div>
            ) : (
              <GradeYearSelector onSelect={handleSelect} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
