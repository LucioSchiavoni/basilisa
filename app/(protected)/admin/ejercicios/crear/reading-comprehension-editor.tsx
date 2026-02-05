"use client"

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
} from "@/components/ui/form"
import { Accordion } from "@/components/ui/accordion"
import { Plus } from "lucide-react"
import { QuestionCard } from "./question-card"

interface ReadingComprehensionEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
}

export function ReadingComprehensionEditor({
  form,
}: ReadingComprehensionEditorProps) {
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
      type: "multiple_choice" as const,
      options: [
        { id: optionId1, text: "" },
        { id: optionId2, text: "" },
      ],
      correct_option_id: "",
      points: 1,
    })
  }

  function handleReadingTextChange(value: string) {
    form.setValue("content.reading_text", value)
    const count = value.trim().split(/\s+/).filter(Boolean).length
    form.setValue("content.word_count", count)
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        Contenido: Comprension Lectora
      </h3>

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
            <FormLabel>URL de audio del texto (opcional)</FormLabel>
            <FormControl>
              <Input
                value={(field.value as string) ?? ""}
                onChange={field.onChange}
                placeholder="https://..."
              />
            </FormControl>
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
        <Accordion type="multiple" className="space-y-2">
          {fields.map((field, index) => (
            <QuestionCard
              key={field.id}
              form={form}
              questionIndex={index}
              basePath="content.questions"
              variant="reading_comprehension"
              onRemove={() => remove(index)}
            />
          ))}
        </Accordion>
      )}

      <Button type="button" variant="outline" onClick={handleAddQuestion}>
        <Plus className="h-4 w-4 mr-2" />
        Agregar pregunta
      </Button>
    </div>
  )
}
