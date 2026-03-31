"use client"

import { useRouter } from "next/navigation"
import { FloatingParticles } from "@/components/home/floating-particles"
import { ArrowRight } from "lucide-react"

export default function BienvenidaPage() {
  const router = useRouter()

  return (
    <div
      className="theme-fixed-light min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
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

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6">
        <div
          className="w-full rounded-3xl shadow-xl p-8 flex flex-col gap-6"
          style={{ backgroundColor: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)" }}
        >
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-neutral-800">
              ¡Bienvenido a LISA!
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Tu cuenta está confirmada. Antes de empezar, completemos tu perfil para personalizar tu experiencia.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/ejercicios/onboarding")}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-semibold text-white bg-[#579F93] hover:bg-[#4a8e83] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Siguiente
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => router.push("/ejercicios")}
            className="w-full py-2.5 rounded-2xl text-sm font-medium text-neutral-400 border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-600 transition-all duration-200"
          >
            Completar luego
          </button>
        </div>
      </div>
    </div>
  )
}
