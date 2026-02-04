"use client";

import { useActionState } from "react";
import { createExercise, type CreateExerciseState } from "../actions";
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

const initialState: CreateExerciseState = {};

export function CreateExerciseForm() {
  const [state, formAction, pending] = useActionState(createExercise, initialState);

  return (
    <form action={formAction} className="space-y-4">
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
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="Nombre del ejercicio"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <textarea
          id="description"
          name="description"
          placeholder="Descripción detallada del ejercicio"
          required
          className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md bg-background resize-y"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoría</Label>
        <Input
          id="category"
          name="category"
          type="text"
          placeholder="Ej: Respiración, Movilidad"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="difficulty">Dificultad</Label>
        <Select name="difficulty" required defaultValue="easy">
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar dificultad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Fácil</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="hard">Difícil</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instrucciones (opcional)</Label>
        <textarea
          id="instructions"
          name="instructions"
          placeholder="Pasos a seguir para realizar el ejercicio"
          className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md bg-background resize-y"
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creando..." : "Crear Ejercicio"}
      </Button>
    </form>
  );
}
