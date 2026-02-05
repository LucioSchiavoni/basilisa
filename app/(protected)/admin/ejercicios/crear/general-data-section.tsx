"use client"

import { type UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

const difficultyLabels: Record<string, string> = {
  "1": "1 - Muy facil",
  "2": "2 - Facil",
  "3": "3 - Intermedio",
  "4": "4 - Dificil",
  "5": "5 - Muy dificil",
}

interface GeneralDataSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  exerciseTypes: ExerciseType[]
}

export function GeneralDataSection({
  form,
  exerciseTypes,
}: GeneralDataSectionProps) {
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
        name="instructions_audio_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL de audio de instrucciones (opcional)</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} placeholder="https://..." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
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

        <FormField
          control={form.control}
          name="estimated_time_minutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiempo estimado (minutos)</FormLabel>
              <FormControl>
                <Input {...field} type="number" min={1} max={180} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
    </div>
  )
}
