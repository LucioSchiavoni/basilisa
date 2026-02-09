"use client"

import { useFieldArray, type UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Trash2, Plus, Circle, CircleDot } from "lucide-react"

interface QuestionCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  questionIndex: number
  basePath: string
  variant: "multiple_choice" | "reading_comprehension"
  onRemove: () => void
}

export function QuestionCard({
  form,
  questionIndex,
  basePath,
  variant,
  onRemove,
}: QuestionCardProps) {
  const optionsPath = `${basePath}.${questionIndex}.options` as const
  const { fields: optionFields, append: appendOption, remove: removeOption } =
    useFieldArray({
      control: form.control,
      name: optionsPath,
    })

  const correctOptionId = form.watch(
    `${basePath}.${questionIndex}.correct_option_id`
  )
  const watchedOptions = form.watch(optionsPath) as Array<{ id: string }> | undefined

  function handleAddOption() {
    if (optionFields.length >= 6) return
    appendOption({
      id: crypto.randomUUID(),
      text: "",
      ...(variant === "multiple_choice" ? { image_url: "" } : {}),
    })
  }

  function handleSelectCorrect(optionIndex: number) {
    const optionId = form.getValues(`${optionsPath}.${optionIndex}.id`) as string
    form.setValue(
      `${basePath}.${questionIndex}.correct_option_id`,
      optionId,
      { shouldValidate: true }
    )
  }

  function handleRemoveQuestion() {
    if (confirm("¿Eliminar esta pregunta?")) {
      onRemove()
    }
  }

  return (
    <AccordionItem value={`question-${questionIndex}`}>
      <AccordionTrigger className="hover:no-underline px-4">
        <div className="flex items-center gap-2 text-left">
          <span className="font-medium">
            Pregunta {questionIndex + 1}
          </span>
          <span className="text-sm text-muted-foreground truncate max-w-[300px]">
            {form.watch(`${basePath}.${questionIndex}.text`) || "Sin texto"}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-4">
        <FormField
          control={form.control}
          name={`${basePath}.${questionIndex}.text`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto de la pregunta</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Escribe la pregunta" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {variant === "multiple_choice" && (
          <>
            <FormField
              control={form.control}
              name={`${basePath}.${questionIndex}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripcion (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Descripcion o contexto adicional (opcional)"
                      className="min-h-[60px] resize-y"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`${basePath}.${questionIndex}.image_url`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de imagen (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${basePath}.${questionIndex}.audio_url`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de audio (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`${basePath}.${questionIndex}.points`}
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
                name={`${basePath}.${questionIndex}.explanation`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explicacion (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="Por que es correcta" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {variant === "reading_comprehension" && (
          <FormField
            control={form.control}
            name={`${basePath}.${questionIndex}.points`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Puntos</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min={1} className="w-24" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="space-y-2">
          <FormLabel>Opciones</FormLabel>
          <FormField
            control={form.control}
            name={`${basePath}.${questionIndex}.correct_option_id`}
            render={() => (
              <FormItem>
                <FormMessage />
              </FormItem>
            )}
          />
          {optionFields.map((optionField, optionIndex) => {
            const actualOptionId = watchedOptions?.[optionIndex]?.id
            return (
            <div key={optionField.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectCorrect(optionIndex)}
                className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                title="Marcar como correcta"
              >
                {correctOptionId === actualOptionId ? (
                  <CircleDot className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>

              <FormField
                control={form.control}
                name={`${optionsPath}.${optionIndex}.text`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={`Opcion ${optionIndex + 1}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {variant === "multiple_choice" && (
                <FormField
                  control={form.control}
                  name={`${optionsPath}.${optionIndex}.image_url`}
                  render={({ field }) => (
                    <FormItem className="w-40">
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="URL imagen"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeOption(optionIndex)}
                disabled={optionFields.length <= 2}
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            )
          })}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            disabled={optionFields.length >= 6}
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar opcion
          </Button>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemoveQuestion}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar pregunta
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
