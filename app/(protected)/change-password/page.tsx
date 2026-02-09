"use client";

import { useActionState } from "react";
import { changePassword, type ChangePasswordState } from "./actions";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ChangePasswordState = {};

export default function ChangePasswordPage() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
      <div className="w-full max-w-md bg-white dark:bg-card rounded-3xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl">🔐</div>
          <h1 className="text-2xl font-bold">Crea tu contraseña secreta</h1>
          <p className="text-muted-foreground">
            Elige una contraseña nueva que solo tu conozcas
          </p>
        </div>

        {state.error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-xl dark:bg-red-900/20">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base">🔑 Nueva contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Tu nueva contraseña"
              className="h-12 text-lg rounded-xl"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-base">🔑 Repite la contraseña</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repite tu contraseña"
              className="h-12 text-lg rounded-xl"
              autoComplete="new-password"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg rounded-xl"
            disabled={pending}
          >
            {pending ? "Guardando..." : "¡Guardar mi contraseña! ✨"}
          </Button>
        </form>

        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Lo haré después
          </Button>
        </form>
      </div>
    </div>
  );
}
