"use client";

import { useActionState } from "react";
import { completeProfile, type ProfileState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: ProfileState = {};

export default function CompletarPerfilPage() {
  const [state, formAction, pending] = useActionState(completeProfile, initialState);

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (/\d/.test(e.key)) {
      e.preventDefault();
    }
  }

  function handlePhoneKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  }

  function handlePhoneInput(e: React.FormEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    input.value = input.value.replace(/\D/g, "");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Completa tu perfil</CardTitle>
          <CardDescription>
            Necesitamos algunos datos adicionales para continuar
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            {state.error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Juan Pérez"
                onKeyDown={handleNameKeyDown}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Fecha de nacimiento</Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="flex gap-2">
                <Select name="country_code" defaultValue="+598">
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Código" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+598">🇺🇾 +598</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="91234567"
                  onKeyDown={handlePhoneKeyDown}
                  onInput={handlePhoneInput}
                  className="flex-1"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Guardando..." : "Continuar"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
