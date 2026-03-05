"use client"

import { useState } from "react"
import { X, Check, ArrowLeft, ArrowRight, Mail } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { register } from "@/app/(auth)/actions"

const GRADES = [
  { value: "1_liceo", label: "1° Liceo", number: "1", color: "#C73341" },
  { value: "2_liceo", label: "2° Liceo", number: "2", color: "#579F93" },
  { value: "3_liceo", label: "3° Liceo", number: "3", color: "#D3A021" },
  { value: "4_liceo", label: "4° Liceo", number: "4", color: "#2E85C8" },
  { value: "5_liceo", label: "5° Liceo", number: "5", color: "#C73341" },
  { value: "6_liceo", label: "6° Liceo", number: "6", color: "#579F93" },
]

type Props = { onClose: () => void }

export function RegisterModal({ onClose }: Props) {
  const [step, setStep] = useState(1)
  const [grade, setGrade] = useState<string | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleGoogleSignUp() {
    if (grade) localStorage.setItem("register_grade", grade)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set("grade", grade ?? "")
    const result = await register(undefined as never, formData)
    setPending(false)
    if (result?.error) setError(result.error)
    if (result?.success) setSuccess(true)
  }

  function goBack() {
    setStep(1)
    setShowEmailForm(false)
    setError(null)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: "radial-gradient(ellipse 130% 90% at 50% 45%, #fdf9f4 0%, #faf3ea 50%, #f6ece0 100%)",
        }}
      >
        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {[1, 2].map((s) => (
            <div
              key={s}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: step === s ? 24 : 8,
                backgroundColor: step === s ? "#579F93" : "#d1d5db",
              }}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-neutral-200/60 transition-colors"
        >
          <X className="h-4 w-4 text-neutral-500" />
        </button>

        <div className="p-8 pt-12">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#579F93]/15">
                <Check className="h-8 w-8 text-[#579F93]" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-800">¡Cuenta creada!</h2>
              <p className="text-sm text-neutral-500">Revisá tu email para verificar tu cuenta.</p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 rounded-full text-sm font-medium text-white bg-[#579F93] hover:bg-[#4a8e83] transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : step === 1 ? (
            <div className="flex flex-col gap-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-semibold text-neutral-800">¿Qué clase estás cursando?</h2>
                <p className="text-sm text-neutral-500">Elegí tu año para personalizar tu experiencia</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {GRADES.map((g) => {
                  const isSelected = grade === g.value
                  return (
                    <button
                      key={g.value}
                      onClick={() => setGrade(g.value)}
                      className="relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 text-left"
                      style={{
                        borderColor: isSelected ? g.color : "transparent",
                        backgroundColor: isSelected ? g.color + "12" : "rgba(255,255,255,0.7)",
                        boxShadow: isSelected ? `0 2px 12px ${g.color}22` : "0 1px 3px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 transition-all duration-200"
                        style={{
                          backgroundColor: isSelected ? g.color : g.color + "18",
                          color: isSelected ? "white" : g.color,
                        }}
                      >
                        {g.number}
                      </div>
                      <span className="text-sm font-medium text-neutral-700">{g.label}</span>
                      {isSelected && (
                        <div
                          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: g.color }}
                        >
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!grade}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-semibold text-white bg-[#579F93] hover:bg-[#4a8e83] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors self-start -mt-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver
              </button>

              <div className="text-center space-y-1">
                <h2 className="text-2xl font-semibold text-neutral-800">Crear cuenta</h2>
                <p className="text-sm text-neutral-500">Elegí cómo querés registrarte</p>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <button
                onClick={handleGoogleSignUp}
                className="flex items-center justify-center gap-3 w-full h-12 rounded-xl border-2 border-neutral-200 bg-white hover:bg-neutral-50 transition-all duration-200 text-sm font-semibold text-neutral-700 shadow-sm"
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
                  onClick={() => setShowEmailForm(true)}
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-neutral-200 bg-white hover:bg-neutral-50 transition-all duration-200 text-sm font-semibold text-neutral-700"
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
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Contraseña (mínimo 6 caracteres)"
                    className="w-full h-11 rounded-xl border-2 border-neutral-200 bg-white px-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-[#579F93] focus:outline-none transition-colors"
                  />
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="Repetir contraseña"
                    className="w-full h-11 rounded-xl border-2 border-neutral-200 bg-white px-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-[#579F93] focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-semibold text-white bg-[#C73341] hover:bg-[#b02d3a] transition-all duration-200 disabled:opacity-50 mt-1"
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
