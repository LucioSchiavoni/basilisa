"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Mail, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { register } from "../actions"
import { FloatingParticles } from "@/components/home/floating-particles"
import { LisaLogo } from "@/components/svg/lisa-logo"
import { GradeYearSelector } from "@/components/auth/grade-year-selector"

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [gradeYear, setGradeYear] = useState<number | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleGoogleSignUp() {
    if (gradeYear) sessionStorage.setItem("register_grade_year", String(gradeYear))
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?grade_year=${gradeYear ?? ""}`,
      },
    })
  }

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set("grade_year", String(gradeYear ?? ""))
    const result = await register(undefined as never, formData)
    setPending(false)
    if (result?.error) setError(result.error)
    if (result?.success) setSuccess(true)
  }

  return (
    <div
      className="theme-fixed-light min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "#ffffff",
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

      <div className="absolute top-4 left-4 z-20">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-8 -mt-12">
        <LisaLogo className="w-24 h-auto select-none" />

        <div
          className="w-full rounded-3xl shadow-xl p-8"
          style={{ backgroundColor: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)" }}
        >
          {success ? (
            <div className="flex flex-col items-center gap-6 py-6 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#579F93]/15">
                <Check className="h-8 w-8 text-[#579F93]" strokeWidth={2} />
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-neutral-800">¡Cuenta creada!</h2>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 space-y-1">
                  <p className="text-sm font-semibold text-amber-800">Confirmá tu email para continuar</p>
                  <p className="text-sm text-amber-700">
                    Te enviamos un link de verificación. Revisá tu bandeja de entrada y hacé click en el link antes de iniciar sesión.
                  </p>
                </div>
              </div>
              <Link
                href="/login"
                className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors underline underline-offset-2"
              >
                Ya confirmé mi email, ir a iniciar sesión
              </Link>
            </div>
          ) : step === 1 ? (
            <div className="flex flex-col gap-7">
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-semibold text-neutral-800">¿Qué año estás cursando?</h1>
                <p className="text-sm text-neutral-500">Elegí tu año para personalizar tu experiencia en LISA</p>
              </div>

              <GradeYearSelector
                onSelect={(year) => {
                  setGradeYear(year)
                  setStep(2)
                }}
              />

              <p className="text-center text-sm text-neutral-400">
                ¿Ya tenés cuenta?{" "}
                <Link href="/login" className="text-[#C73341] hover:underline font-medium">
                  Iniciá sesión
                </Link>
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <button
                type="button"
                onClick={() => { setStep(1); setShowEmailForm(false); setError(null); }}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors self-start"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver
              </button>

              <div className="text-center space-y-1">
                <h2 className="text-2xl font-semibold text-neutral-800">Crear tu cuenta</h2>
                <p className="text-sm text-neutral-500">Elegí cómo querés registrarte</p>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="flex items-center justify-center gap-3 w-full h-12 rounded-xl border-2 border-neutral-200 bg-white hover:bg-neutral-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm font-semibold text-neutral-700 shadow-sm"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuar con Google
              </button>

              {!showEmailForm ? (
                <button
                  type="button"
                  onClick={() => setShowEmailForm(true)}
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-neutral-200 bg-white hover:bg-neutral-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm font-semibold text-neutral-700"
                >
                  <Mail className="h-4 w-4" />
                  Registrarme con email
                </button>
              ) : (
                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                    className="w-full h-11 rounded-xl border-2 border-neutral-200 bg-white px-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-[#579F93] focus:outline-none transition-colors"
                  />
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Contraseña (mínimo 6 caracteres)"
                      className="w-full h-11 rounded-xl border-2 border-neutral-200 bg-white px-4 pr-10 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-[#579F93] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      required
                      placeholder="Repetir contraseña"
                      className="w-full h-11 rounded-xl border-2 border-neutral-200 bg-white px-4 pr-10 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-[#579F93] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-semibold text-white bg-[#C73341] hover:bg-[#b02d3a] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 mt-1"
                  >
                    {pending ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creando cuenta...
                      </>
                    ) : "Crear cuenta"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
