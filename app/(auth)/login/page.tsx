"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { login, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { FloatingParticles } from "@/components/home/floating-particles";
import { LisaIllustrationAnimated } from "@/components/svg/lisa-illustration-animated";
import { CharacterBlink } from "@/components/game/CharacterBlink";

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="theme-fixed-light min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse 130% 90% at 50% 45%, #fdf9f4 0%, #faf3ea 50%, #f6ece0 100%)"
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

      <div className="absolute top-4 left-4 z-50">
        <Button variant="ghost" size="icon" asChild className="rounded-full bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:scale-110 transition-all">
          <Link href="/">
            <ArrowLeft className="h-5 w-5 text-black" />
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-16 relative z-10">

        <div className="hidden lg:flex items-center justify-center">
          <CharacterBlink />
        </div>

        <div className="w-full flex justify-center">
          <div className="w-full max-w-md">
            <div className="hidden lg:flex justify-center mb-6">
              <LisaIllustrationAnimated className="w-72 h-auto" />
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-[#579F93]/20 shadow-xl shadow-[#579F93]/5 p-6 sm:p-8 space-y-6 transition-all">
              <div className="text-center space-y-2">
                <h1 className="text-2xl  text-black">
                  Bienvenido de vuelta
                </h1>
              </div>

              {state.error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200 flex items-center gap-2">
                  <span className="text-lg">oops!</span>
                  {state.error}
                </div>
              )}

              <GoogleOAuthButton />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#579F93]/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#faf3ea] px-3 text-black/60 font-medium">
                    o con tu email
                  </span>
                </div>
              </div>

              <form action={formAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-black">
                    Email
                  </Label>
                  <div className={`relative group transition-all duration-300 ${focusedField === "email" ? "scale-[1.02]" : ""}`}>
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focusedField === "email" ? "text-[#579F93]" : "text-black/50"}`} />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      required
                      className="pl-10 h-12 rounded-xl border-2 border-[#579F93]/20 bg-white/50 focus:border-[#579F93] focus:ring-[#579F93]/20 focus-visible:border-[#579F93] focus-visible:ring-[#579F93]/20 transition-all duration-300 text-black placeholder:text-neutral-400"
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm text-black">
                    Contraseña
                  </Label>
                  <div className={`relative group transition-all duration-300 ${focusedField === "password" ? "scale-[1.02]" : ""}`}>
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focusedField === "password" ? "text-[#579F93]" : "text-black/50"}`} />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="pl-10 pr-10 h-12 rounded-xl border-2 border-[#579F93]/20 bg-white/50 focus:border-[#579F93] focus:ring-[#579F93]/20 focus-visible:border-[#579F93] focus-visible:ring-[#579F93]/20 transition-all duration-300 text-black"
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-[#579F93] transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={pending}
                  className="w-full h-12 rounded-xl text-base font-bold bg-[#C73341] hover:bg-[#b02d3a] text-white shadow-lg shadow-[#C73341]/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border-0"
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
                <Link href="/forgot-password" className="text-[#C73341] hover:text-[#b02d3a] hover:underline block transition-colors font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
                <Link
                  href="/patient-login"
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border-2 border-[#2E85C8]/40 text-[#2E85C8] font-semibold hover:bg-[#2E85C8]/5 hover:border-[#2E85C8] transition-all duration-200"
                >
                  <span className="text-base">📖</span>
                  Soy lector
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
