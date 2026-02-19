"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { login, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Mail, Lock, Sparkles, BookOpen } from "lucide-react";
import animationData from "@/public/lottie/education new color scheme.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-pink-50 via-fuchsia-50 to-white dark:from-[#1a2332] dark:via-[#1e2a3a] dark:to-[#162030]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#b7205a]/10 dark:bg-[#b7205a]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-[#b7205a]/8 dark:bg-[#b7205a]/5 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-fuchsia-200/20 dark:bg-fuchsia-500/5 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
      </div>

      <div className="absolute top-4 left-4 z-50">
        <Button variant="ghost" size="icon" asChild className="rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/20 hover:scale-110 transition-all">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-6 lg:gap-12 relative z-10">
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center">
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-br from-[#b7205a]/15 to-fuchsia-300/20 dark:from-[#b7205a]/10 dark:to-fuchsia-500/5 rounded-[3rem] blur-2xl" />
            <Lottie
              animationData={animationData}
              loop
              autoplay
              className="w-full max-w-md relative z-10"
            />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <BookOpen className="h-5 w-5 text-[#b7205a]" />
            <p className="text-lg font-semibold text-[#263238] dark:text-fuchsia-300">
              Aprende jugando
            </p>
            <Sparkles className="h-5 w-5 text-[#b7205a]" />
          </div>
        </div>

        <div className="w-full lg:flex-1 flex justify-center">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex justify-center mb-6">
              <Lottie
                animationData={animationData}
                loop
                autoplay
                className="w-48 h-48"
              />
            </div>

            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl border-2 border-[#b7205a]/20 dark:border-[#b7205a]/30 shadow-xl shadow-[#b7205a]/10 dark:shadow-none p-6 sm:p-8 space-y-6 transition-all">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-[#263238] dark:text-white">
                  Bienvenido de vuelta
                </h1>
                <p className="text-sm text-[#455a64] dark:text-gray-400">
                  Ingresa para continuar tu aventura
                </p>
              </div>

              {state.error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-500/20 flex items-center gap-2">
                  <span className="text-lg">oops!</span>
                  {state.error}
                </div>
              )}

              <GoogleOAuthButton />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#b7205a]/20 dark:border-[#b7205a]/30" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/70 dark:bg-transparent px-3 text-[#b7205a]/70 dark:text-fuchsia-400/70 font-medium">
                    o con tu email
                  </span>
                </div>
              </div>

              <form action={formAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-[#263238] dark:text-gray-200">
                    Email
                  </Label>
                  <div className={`relative group transition-all duration-300 ${focusedField === "email" ? "scale-[1.02]" : ""}`}>
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focusedField === "email" ? "text-[#b7205a]" : "text-[#455a64] dark:text-gray-500"}`} />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      required
                      className="pl-10 h-12 rounded-xl border-2 border-[#b7205a]/20 dark:border-[#b7205a]/30 bg-white/50 dark:bg-white/5 focus:border-[#b7205a] dark:focus:border-[#b7205a] focus:ring-[#b7205a]/20 transition-all duration-300"
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-[#263238] dark:text-gray-200">
                    Contraseña
                  </Label>
                  <div className={`relative group transition-all duration-300 ${focusedField === "password" ? "scale-[1.02]" : ""}`}>
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focusedField === "password" ? "text-[#b7205a]" : "text-[#455a64] dark:text-gray-500"}`} />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="pl-10 h-12 rounded-xl border-2 border-[#b7205a]/20 dark:border-[#b7205a]/30 bg-white/50 dark:bg-white/5 focus:border-[#b7205a] dark:focus:border-[#b7205a] focus:ring-[#b7205a]/20 transition-all duration-300"
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={pending}
                  className="w-full h-12 rounded-xl text-base font-bold bg-[#b7205a] hover:bg-[#9a1a4c] text-white shadow-lg shadow-[#b7205a]/25 dark:shadow-[#b7205a]/15 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border-0"
                >
                  {pending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Ingresando...
                    </span>
                  ) : (
                    "Comenzar"
                  )}
                </Button>
              </form>

              <div className="text-sm text-center space-y-3 pt-2">
                <Link href="/forgot-password" className="text-[#b7205a] dark:text-fuchsia-400 hover:text-[#9a1a4c] dark:hover:text-fuchsia-300 hover:underline block transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
                <Link
                  href="/patient-login"
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border-2 border-[#b7205a]/40 dark:border-[#b7205a]/50 text-[#b7205a] dark:text-fuchsia-400 font-semibold hover:bg-[#b7205a]/8 dark:hover:bg-[#b7205a]/15 hover:border-[#b7205a] dark:hover:border-fuchsia-400 transition-all duration-200"
                >
                  <span className="text-base">🎮</span>
                  Soy paciente
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
