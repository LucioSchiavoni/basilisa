"use client"

import { useState, useEffect } from "react"
import { type UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import type { ExerciseType } from "@/types/exercises"
import { WORLDS, getWorldByDifficulty } from "@/lib/worlds"

const difficultyLabels: Record<string, string> = {
  "1": "1 - Muy facil",
  "2": "2 - Facil",
  "3": "3 - Intermedio",
  "4": "4 - Intermedio-Alto",
  "5": "5 - Dificil",
  "6": "6 - Muy dificil",
}

interface GeneralDataSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  exerciseTypes: ExerciseType[]
}

export function GeneralDataSection({ form, exerciseTypes }: GeneralDataSectionProps) {
  const [tagInput, setTagInput] = useState("")
  const tags = (form.watch("tags") as string[]) || []
  const difficultyLevel = Number(form.watch("difficulty_level") ?? 1)
  const assignedWorldId = getWorldByDifficulty(difficultyLevel)
  const assignedWorld = assignedWorldId ? WORLDS[assignedWorldId] : null

  useEffect(() => {
    form.setValue("world_id", assignedWorldId ?? null, { shouldValidate: false })
  }, [assignedWorldId, form])

  function addTag(value: string) {
    const tag = value.trim()
    if (!tag || tags.includes(tag) || tags.length >= 10) return
    form.setValue("tags", [...tags, tag], { shouldValidate: true })
  }

  function removeTag(index: number) {
    form.setValue(
      "tags",
      tags.filter((_, i) => i !== index),
      { shouldValidate: true }
    )
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(tagInput)
      setTagInput("")
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Datos Generales</h3>

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Titulo</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Nombre del ejercicio" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="instructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Instrucciones</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Instrucciones para el paciente"
                className="min-h-[80px] resize-y"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="difficulty_level"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nivel de dificultad</FormLabel>
            <Select
              value={String(field.value)}
              onValueChange={(val) => field.onChange(Number(val))}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(difficultyLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="target_age_min"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Edad minima</FormLabel>
              <FormControl>
                <Input {...field} type="number" min={1} max={100} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="target_age_max"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Edad maxima</FormLabel>
              <FormControl>
                <Input {...field} type="number" min={1} max={100} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="exercise_type_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de ejercicio</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {exerciseTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormItem>
        <FormLabel>Mundo asignado</FormLabel>
        <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-muted text-sm text-muted-foreground">
          {assignedWorld ? assignedWorld.displayName : "Sin mundo"}
        </div>
        <p className="text-xs text-muted-foreground">
          Se asigna automáticamente según el nivel de dificultad.
        </p>
      </FormItem>

      <FormField
        control={form.control}
        name="tags"
        render={() => (
          <FormItem>
            <FormLabel>Etiquetas (opcional)</FormLabel>
            <div className="flex flex-wrap gap-2 min-h-[40px] rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-0.5 rounded-full hover:bg-muted-foreground/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => {
                  if (tagInput.trim()) {
                    addTag(tagInput)
                    setTagInput("")
                  }
                }}
                placeholder={tags.length === 0 ? "Escribe y presiona Enter" : ""}
                className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                disabled={tags.length >= 10}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Presiona Enter o coma para agregar. Maximo 10 etiquetas.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
