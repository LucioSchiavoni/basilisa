"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft } from "lucide-react";

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {state.error}
            </div>
          )}
          <GoogleOAuthButton />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                o continúa con email
              </span>
            </div>
          </div>
        </CardContent>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Ingresando..." : "Ingresar"}
            </Button>
            <div className="text-sm text-center space-y-2">
              <Link href="/forgot-password" className="text-primary hover:underline block">
                ¿Olvidaste tu contraseña?
              </Link>
              <p className="text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Regístrate
                </Link>
              </p>
              <Link href="/patient-login" className="text-primary hover:underline block">
                Soy paciente
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
