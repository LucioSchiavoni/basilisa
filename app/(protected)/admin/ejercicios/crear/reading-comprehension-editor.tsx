"use client"

import { useState } from "react"
import { useFieldArray, type UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { AudioUpload } from "@/components/admin/audio-upload"
import { QuestionCard } from "./question-card"

interface ReadingComprehensionEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  exerciseId?: string
}

export function ReadingComprehensionEditor({
  form,
  exerciseId,
}: ReadingComprehensionEditorProps) {
  const [activeQuestion, setActiveQuestion] = useState(0)
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "content.questions",
  })

  const readingText = form.watch("content.reading_text") as string
  const wordCount =
    readingText?.trim().split(/\s+/).filter(Boolean).length ?? 0

  function handleAddQuestion() {
    const optionId1 = crypto.randomUUID()
    const optionId2 = crypto.randomUUID()
    append({
      id: crypto.randomUUID(),
      text: "",
      question_image_url: "",
      question_audio_url: "",
      type: "multiple_choice" as const,
      options: [
        { id: optionId1, text: "", image_url: "" },
        { id: optionId2, text: "", image_url: "" },
      ],
      correct_option_id: "",
      points: 1,
    })
    setActiveQuestion(fields.length)
  }

  function handleRemoveQuestion(index: number) {
    remove(index)
    setActiveQuestion((prev) =>
      Math.min(prev, Math.max(fields.length - 2, 0))
    )
  }

  function handleReadingTextChange(value: string) {
    form.setValue("content.reading_text", value)
    const count = value.trim().split(/\s+/).filter(Boolean).length
    form.setValue("content.word_count", count)
  }

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="content.reading_text"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Texto de lectura</FormLabel>
              <Badge variant="secondary">{wordCount} palabras</Badge>
            </div>
            <FormControl>
              <Textarea
                value={field.value as string}
                onChange={(e) => handleReadingTextChange(e.target.value)}
                placeholder="Escribe o pega el texto de lectura aqui..."
                className="min-h-[200px] resize-y"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="content.reading_audio_url"
        render={({ field }) => (
          <FormItem>
            <AudioUpload
              value={field.value ?? ""}
              onChange={(url) => field.onChange(url || null)}
              path={`reading/${exerciseId ?? "temp"}/`}
              label="Audio del texto (opcional)"
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="content.hide_text_during_questions"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value as boolean}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="font-normal">
              Ocultar texto durante las preguntas
            </FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="content.questions"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />

      {fields.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setActiveQuestion((i) => i - 1)}
              disabled={activeQuestion === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Pregunta {activeQuestion + 1} de {fields.length}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setActiveQuestion((i) => i + 1)}
              disabled={activeQuestion >= fields.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {fields.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {fields.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveQuestion(i)}
                  className={cn(
                    "h-8 w-8 rounded-full text-xs font-medium shrink-0 transition-colors",
                    i === activeQuestion
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted-foreground/20"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          <QuestionCard
            key={fields[activeQuestion]?.id}
            form={form}
            questionIndex={activeQuestion}
            basePath="content.questions"
            variant="reading_comprehension"
            exerciseId={exerciseId}
            onRemove={() => handleRemoveQuestion(activeQuestion)}
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button type="button" variant="outline" onClick={handleAddQuestion}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar pregunta
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting} className="sm:ml-auto">
          {form.formState.isSubmitting ? "Guardando..." : "Guardar ejercicio"}
        </Button>
      </div>
    </div>
  )
}
