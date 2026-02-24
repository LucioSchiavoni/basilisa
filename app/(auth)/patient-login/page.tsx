"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { patientLogin, type PatientLoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FloatingParticles } from "@/components/home/floating-particles";
import { ArrowLeft, Eye, EyeOff, User, Lock } from "lucide-react";

const initialState: PatientLoginState = {};

export default function PatientLoginPage() {
  const [state, formAction, pending] = useActionState(patientLogin, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <div
      className="theme-fixed-light relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
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

      <div className="absolute top-4 left-4 z-20">
        <Button variant="ghost" size="icon" asChild className="rounded-full bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:scale-110 transition-all">
          <Link href="/login">
            <ArrowLeft className="h-5 w-5 text-black" />
          </Link>
        </Button>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl border-2 border-[#579F93]/20 shadow-xl shadow-[#579F93]/5 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl select-none">👋</div>
          <h1 className="text-2xl font-bold text-black">¡Hola!</h1>
          <p className="text-black/80 font-medium">Ingresa con tu usuario y contraseña</p>
        </div>

        {state.error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-semibold text-black flex items-center gap-2">
              Usuario
            </Label>
            <div className={`relative group transition-all duration-300 ${focusedField === "username" ? "scale-[1.02]" : ""}`}>
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focusedField === "username" ? "text-[#579F93]" : "text-black/50"}`} />
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Tu nombre de usuario"
                className="pl-10 h-12 rounded-xl border-2 border-[#579F93]/20 bg-white/50 focus:border-[#579F93] focus:ring-[#579F93]/20 focus-visible:border-[#579F93] focus-visible:ring-[#579F93]/20 transition-all duration-300 text-black placeholder:text-neutral-400"
                autoComplete="username"
                required
                onFocus={() => setFocusedField("username")}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-black flex items-center gap-2">
              Contraseña
            </Label>
            <div className={`relative group transition-all duration-300 ${focusedField === "password" ? "scale-[1.02]" : ""}`}>
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focusedField === "password" ? "text-[#579F93]" : "text-black/50"}`} />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                className="pl-10 pr-10 h-12 rounded-xl border-2 border-[#579F93]/20 bg-white/50 focus:border-[#579F93] focus:ring-[#579F93]/20 focus-visible:border-[#579F93] focus-visible:ring-[#579F93]/20 transition-all duration-300 text-black placeholder:text-neutral-400"
                autoComplete="current-password"
                required
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
                Entrando...
              </span>
            ) : "¡Entrar! ✨"}
          </Button>
        </form>
      </div>
    </div>
  );
}
