"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { changePassword, type ChangePasswordState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, CheckCircle2, KeyRound } from "lucide-react";
import { FloatingParticles } from "@/components/home/floating-particles";

const initialState: ChangePasswordState = {};

export default function ChangePasswordPage() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (state.success) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden">
        <FloatingParticles />
        <div className="w-full max-w-md bg-white dark:bg-card rounded-3xl shadow-xl p-8 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">¡Contraseña actualizada!</h1>
            <p className="text-muted-foreground">
              Tu contraseña se cambió correctamente.
            </p>
          </div>
          <Button asChild className="w-full h-12 rounded-xl text-base">
            <Link href="/ejercicios">Volver a ejercicios</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden">
      <FloatingParticles />
      <div className="w-full max-w-md bg-white dark:bg-card rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 pb-0">
          <Link
            href="/ejercicios"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <KeyRound className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Cambiar contraseña</h1>
            <p className="text-sm text-muted-foreground">
              Ingresá tu contraseña actual y luego la nueva
            </p>
          </div>

          {state.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  placeholder="Tu contraseña actual"
                  className="h-12 rounded-xl pr-11"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showNew ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  className="h-12 rounded-xl pr-11"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Repetir nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repetí la nueva contraseña"
                  className="h-12 rounded-xl pr-11"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base rounded-xl mt-2"
              disabled={pending}
            >
              {pending ? "Guardando..." : "Guardar nueva contraseña"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
