"use client";

import { useActionState } from "react";
import Link from "next/link";
import { patientLogin, type PatientLoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FloatingParticles } from "@/components/home/floating-particles";
import { ArrowLeft } from "lucide-react";

const initialState: PatientLoginState = {};

export default function PatientLoginPage() {
  const [state, formAction, pending] = useActionState(patientLogin, initialState);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-background">
      <FloatingParticles />
      <div className="absolute top-4 left-4 z-20">
        <Button variant="ghost" size="icon" asChild className="rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/20 hover:scale-110 transition-all">
          <Link href="/login">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>
      <div className="relative z-10 w-full max-w-md bg-white/80 dark:bg-card/80 backdrop-blur-md rounded-3xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl">👋</div>
          <h1 className="text-2xl font-bold">¡Hola!</h1>
          <p className="text-muted-foreground">Ingresa con tu usuario y contraseña</p>
        </div>

        {state.error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-xl dark:bg-red-900/20">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-base">👤 Usuario</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Tu nombre de usuario"
              className="h-12 text-lg rounded-xl"
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base">🔑 Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Tu contraseña"
              className="h-12 text-lg rounded-xl"
              autoComplete="current-password"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg rounded-xl"
            disabled={pending}
          >
            {pending ? "Entrando..." : "¡Entrar! ✨"}
          </Button>
        </form>

      </div>
    </div>
  );
}
