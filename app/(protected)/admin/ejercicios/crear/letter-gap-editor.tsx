"use client"

import { useState } from "react"
import { useFieldArray, type UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Plus, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { AudioUpload } from "@/components/admin/audio-upload"

interface LetterGapEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  exerciseId?: string
}

export function LetterGapEditor({ form, exerciseId }: LetterGapEditorProps) {
  const [activeSentence, setActiveSentence] = useState(0)
  const [distractorInput, setDistractorInput] = useState("")

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "content.sentences",
  })

  const distractors = (form.watch("content.distractors") as string[]) || []

  function handleAddSentence() {
    append({
      id: crypto.randomUUID(),
      full_sentence: "",
      display_sentence: "",
      correct_answer: "",
      hint: "",
      points: 10,
    })
    setActiveSentence(fields.length)
  }

  function handleRemoveSentence(index: number) {
    remove(index)
    setActiveSentence((prev) =>
      Math.min(prev, Math.max(fields.length - 2, 0))
    )
  }

  function handleAddDistractor(value: string) {
    const word = value.trim()
    if (!word || distractors.includes(word)) return
    form.setValue("content.distractors", [...distractors, word], {
      shouldValidate: true,
    })
  }

  function handleRemoveDistractor(index: number) {
    form.setValue(
      "content.distractors",
      distractors.filter((_, i) => i !== index),
      { shouldValidate: true }
    )
  }

  function handleDistractorKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      handleAddDistractor(distractorInput)
      setDistractorInput("")
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Contenido: Fuga de Letras</h3>

      <FormField
        control={form.control}
        name="content.reading_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Texto de lectura (opcional)</FormLabel>
            <FormDescription>
              Texto de contexto que el paciente leerá antes de completar las frases
            </FormDescription>
            <FormControl>
              <Textarea
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value || null)}
                placeholder="Escribe un texto de referencia (opcional)..."
                className="min-h-[120px] resize-y"
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
              path={`letter-gap/${exerciseId ?? "temp"}/`}
              label="Audio del texto (opcional)"
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="content.shuffle_options"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value as boolean}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="font-normal">Mezclar opciones</FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="content.sentences"
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
              onClick={() => setActiveSentence((i) => i - 1)}
              disabled={activeSentence === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Frase {activeSentence + 1} de {fields.length}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setActiveSentence((i) => i + 1)}
              disabled={activeSentence >= fields.length - 1}
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
                  onClick={() => setActiveSentence(i)}
                  className={cn(
                    "h-8 w-8 rounded-full text-xs font-medium shrink-0 transition-colors",
                    i === activeSentence
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted-foreground/20"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          <SentenceCard
            key={fields[activeSentence]?.id}
            form={form}
            sentenceIndex={activeSentence}
            onRemove={() => handleRemoveSentence(activeSentence)}
          />
        </div>
      )}

      <div className="space-y-3">
        <FormLabel>Distractores (palabras incorrectas)</FormLabel>
        <div className="flex flex-wrap gap-2 min-h-[40px] rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          {distractors.map((word, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {word}
              <button
                type="button"
                onClick={() => handleRemoveDistractor(index)}
                className="ml-0.5 rounded-full hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <input
            type="text"
            value={distractorInput}
            onChange={(e) => setDistractorInput(e.target.value)}
            onKeyDown={handleDistractorKeyDown}
            onBlur={() => {
              if (distractorInput.trim()) {
                handleAddDistractor(distractorInput)
                setDistractorInput("")
              }
            }}
            placeholder={
              distractors.length === 0
                ? "Escribe palabras falsas y presiona Enter"
                : ""
            }
            className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Estas palabras se mezclarán con las respuestas correctas como opciones falsas
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button type="button" variant="outline" onClick={handleAddSentence}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar frase
        </Button>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="sm:ml-auto"
        >
          {form.formState.isSubmitting ? "Guardando..." : "Guardar ejercicio"}
        </Button>
      </div>
    </div>
  )
}

function SentenceCard({
  form,
  sentenceIndex,
  onRemove,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  sentenceIndex: number
  onRemove: () => void
}) {
  const basePath = `content.sentences.${sentenceIndex}`
  const fullSentence = (form.watch(`${basePath}.full_sentence`) as string) || ""
  const correctAnswer =
    (form.watch(`${basePath}.correct_answer`) as string) || ""
  const words = fullSentence.trim().split(/\s+/).filter(Boolean)

  function handleSelectWord(word: string) {
    form.setValue(`${basePath}.correct_answer`, word, { shouldValidate: true })
    const display = fullSentence.replace(
      new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"),
      "_______"
    )
    form.setValue(`${basePath}.display_sentence`, display, {
      shouldValidate: true,
    })
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <FormField
        control={form.control}
        name={`${basePath}.full_sentence`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Frase completa</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Ej: El gato toma leche en el plato"
                onChange={(e) => {
                  field.onChange(e)
                  form.setValue(`${basePath}.correct_answer`, "", {
                    shouldValidate: false,
                  })
                  form.setValue(`${basePath}.display_sentence`, "", {
                    shouldValidate: false,
                  })
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {words.length > 0 && (
        <div className="space-y-2">
          <FormLabel>
            Selecciona la palabra faltante
          </FormLabel>
          <div className="flex flex-wrap gap-2">
            {words.map((word, i) => (
              <button
                key={`${word}-${i}`}
                type="button"
                onClick={() => handleSelectWord(word)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                  correctAnswer === word
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted hover:bg-muted-foreground/20 border-transparent"
                )}
              >
                {word}
              </button>
            ))}
          </div>
          <FormField
            control={form.control}
            name={`${basePath}.correct_answer`}
            render={() => (
              <FormItem>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {correctAnswer && (
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-sm text-muted-foreground mb-1">Vista previa:</p>
          <p className="text-base">
            {form.watch(`${basePath}.display_sentence`)}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`${basePath}.points`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Puntos</FormLabel>
              <FormControl>
                <Input {...field} type="number" min={1} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${basePath}.hint`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pista (opcional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Una pista para ayudar"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Eliminar frase
        </Button>
      </div>
    </div>
  )
}
