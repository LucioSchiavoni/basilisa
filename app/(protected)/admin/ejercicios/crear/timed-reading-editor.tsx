"use client"

import { type UseFormReturn } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"

interface TimedReadingEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
}

export function TimedReadingEditor({ form }: TimedReadingEditorProps) {
  const readingText = form.watch("content.reading_text") as string
  const wordCount =
    readingText?.trim().split(/\s+/).filter(Boolean).length ?? 0

  function handleReadingTextChange(value: string) {
    form.setValue("content.reading_text", value)
    const count = value.trim().split(/\s+/).filter(Boolean).length
    form.setValue("content.word_count", count)
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Contenido: Lectura Cronometrada</h3>

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
                className="min-h-[250px] resize-y"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="content.show_timer"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value as boolean}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Mostrar segundos al paciente</FormLabel>
              <FormDescription>
                Si está activado, el paciente verá el cronómetro mientras lee
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {readingText && readingText.trim().length >= 10 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Vista previa
          </h4>
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {readingText}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
