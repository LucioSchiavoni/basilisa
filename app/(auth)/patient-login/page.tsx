"use client";

import { useActionState } from "react";
import Link from "next/link";
import { patientLogin, type PatientLoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: PatientLoginState = {};

export default function PatientLoginPage() {
  const [state, formAction, pending] = useActionState(patientLogin, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
      <div className="w-full max-w-md bg-white dark:bg-card rounded-3xl shadow-xl p-8 space-y-6">
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

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary hover:underline"
          >
            Soy administrador
          </Link>
        </div>
      </div>
    </div>
  );
}
