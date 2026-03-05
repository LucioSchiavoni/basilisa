"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { forgotPassword, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FloatingParticles } from "@/components/home/floating-particles";
import { ArrowLeft, AtSign, Mail } from "lucide-react";

const initialState: AuthState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPassword, initialState);
  const [focused, setFocused] = useState(false);

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
          <Link href="/login">
            <ArrowLeft className="h-5 w-5 text-black" />
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-[#579F93]/20 shadow-xl shadow-[#579F93]/5 p-6 sm:p-8 space-y-6">

          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#2E85C8" }}>
              <Mail className="h-7 w-7 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-black">Recuperar contraseña</h1>
              <p className="text-sm text-black/60">Te enviaremos un link para restablecer tu contraseña</p>
            </div>
          </div>

          {state.error && (
            <div className="p-3 text-sm text-[#C73341] bg-[#C73341]/8 rounded-xl border border-[#C73341]/20 flex items-center gap-2">
              <span className="font-medium">oops!</span>
              {state.error}
            </div>
          )}

          {state.success ? (
            <div className="p-4 text-sm text-[#579F93] bg-[#579F93]/8 rounded-xl border border-[#579F93]/20 text-center space-y-1">
              <p className="font-semibold text-base">¡Listo!</p>
              <p>{state.success}</p>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-black">Email</Label>
                <div className={`relative transition-all duration-300 ${focused ? "scale-[1.02]" : ""}`}>
                  <AtSign className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focused ? "text-[#579F93]" : "text-black/50"}`} />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    className="pl-10 h-12 rounded-xl border-2 border-[#579F93]/20 bg-white/50 focus:border-[#579F93] focus:ring-[#579F93]/20 focus-visible:border-[#579F93] focus-visible:ring-[#579F93]/20 transition-all duration-300 text-black placeholder:text-neutral-400"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={pending}
                className="w-full h-12 rounded-xl text-base font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border-0 tracking-wide"
                style={{ background: "#C73341", boxShadow: "0 4px 20px rgba(199,51,65,0.25)", fontFamily: "Lexend, sans-serif" }}
              >
                {pending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  "Enviar link"
                )}
              </Button>
            </form>
          )}

          <div className="text-sm text-center pt-1">
            <Link href="/login" className="text-[#579F93] hover:text-[#47897d] hover:underline transition-colors font-medium">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
