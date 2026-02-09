"use client"

import { useFieldArray, type UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

interface MultipleChoiceEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
}

export function MultipleChoiceEditor({ form }: MultipleChoiceEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "content.questions",
  })

  function handleAddQuestion() {
    const optionId1 = crypto.randomUUID()
    const optionId2 = crypto.randomUUID()
    append({
      id: crypto.randomUUID(),
      text: "",
      description: "",
      image_url: "",
      audio_url: "",
      options: [
        { id: optionId1, text: "", image_url: "" },
        { id: optionId2, text: "", image_url: "" },
      ],
      correct_option_id: "",
      explanation: "",
      points: 1,
    })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Contenido: Opcion Multiple</h3>

      <div className="flex flex-wrap gap-6">
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
          name="content.shuffle_questions"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">Mezclar preguntas</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content.show_feedback"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">Mostrar feedback</FormLabel>
            </FormItem>
          )}
        />
      </div>

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
              variant="multiple_choice"
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
