"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createAccount, type CreateAccountState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const passwordRules = [
  { test: (v: string) => v.length >= 8, label: "Mínimo 8 caracteres" },
  { test: (v: string) => /[A-Z]/.test(v), label: "Una letra mayúscula" },
  { test: (v: string) => /[a-z]/.test(v), label: "Una letra minúscula" },
  { test: (v: string) => /[0-9]/.test(v), label: "Un número" },
  {
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
    label: "Un carácter especial (!@#$%&*)",
  },
];

const initialState: CreateAccountState = {};

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createAccount, initialState);
  const [accountType, setAccountType] = useState<"patient" | "user">("patient");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="account_type" value={accountType} />

      {state.error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md dark:bg-red-900/20">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="p-3 text-sm text-green-500 bg-green-50 rounded-md dark:bg-green-900/20">
          {state.success}
        </div>
      )}

      <div className="space-y-2">
        <Label>Tipo de cuenta</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAccountType("patient")}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-colors ${
              accountType === "patient"
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-muted-foreground/30"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={accountType === "patient" ? "text-primary" : "text-muted-foreground"}
            >
              <path d="M9 12h.01" />
              <path d="M15 12h.01" />
              <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
              <path d="M19.5 10c.5 0 1 .5 1 1v1c0 .5-.5 1-1 1H19a6.5 6.5 0 0 1-13 0h-.5c-.5 0-1-.5-1-1v-1c0-.5.5-1 1-1H6a6.5 6.5 0 0 1 12 0h1.5z" />
            </svg>
            <span className={`text-sm font-medium ${accountType === "patient" ? "text-primary" : "text-muted-foreground"}`}>
              Paciente
            </span>
            <span className="text-[11px] text-muted-foreground">Sin correo</span>
          </button>
          <button
            type="button"
            onClick={() => setAccountType("user")}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-colors ${
              accountType === "user"
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-muted-foreground/30"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={accountType === "user" ? "text-primary" : "text-muted-foreground"}
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className={`text-sm font-medium ${accountType === "user" ? "text-primary" : "text-muted-foreground"}`}>
              Usuario
            </span>
            <span className="text-[11px] text-muted-foreground">Con correo</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Nombre Completo</Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          placeholder="Juan Pérez"
          required
        />
        {state.fieldErrors?.full_name && (
          <p className="text-sm text-red-500">{state.fieldErrors.full_name[0]}</p>
        )}
      </div>

      {accountType === "patient" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de Usuario</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="juanperez"
              pattern="[a-zA-Z0-9]+"
              title="Solo letras y números"
              required
            />
            <p className="text-xs text-muted-foreground">
              Solo letras y números, sin espacios
            </p>
            {state.fieldErrors?.username && (
              <p className="text-sm text-red-500">{state.fieldErrors.username[0]}</p>
            )}
          </div>
          <div className="p-3 text-sm bg-blue-50 text-blue-700 rounded-md dark:bg-blue-900/20 dark:text-blue-400">
            Contraseña inicial: <strong>Basilisa2025</strong>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              required
            />
            {state.fieldErrors?.email && (
              <p className="text-sm text-red-500">{state.fieldErrors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {state.fieldErrors?.password && (
              <ul className="text-sm text-red-500 list-disc list-inside">
                {state.fieldErrors.password.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            )}
            {password.length > 0 && (
              <ul className="space-y-1 text-sm">
                {passwordRules.map((rule) => {
                  const passes = rule.test(password);
                  return (
                    <li
                      key={rule.label}
                      className={passes ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}
                    >
                      <span className="mr-1.5">{passes ? "✓" : "○"}</span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirmar Contraseña</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {state.fieldErrors?.confirm_password && (
              <p className="text-sm text-red-500">{state.fieldErrors.confirm_password[0]}</p>
            )}
            {passwordsMatch && (
              <p className="text-sm text-green-600 dark:text-green-400">
                <span className="mr-1.5">✓</span>Las contraseñas coinciden
              </p>
            )}
            {passwordsMismatch && (
              <p className="text-sm text-red-500">
                <span className="mr-1.5">○</span>Las contraseñas no coinciden
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select name="role" required defaultValue="patient">
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Paciente</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending
          ? "Creando..."
          : accountType === "patient"
            ? "Crear Paciente"
            : "Crear Usuario"
        }
      </Button>
    </form>
  );
}
