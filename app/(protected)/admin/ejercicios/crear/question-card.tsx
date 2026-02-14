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
import { Trash2, Plus, Circle, CircleDot } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageUpload } from "@/components/admin/image-upload"
import { AudioUpload } from "@/components/admin/audio-upload"

interface QuestionCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  questionIndex: number
  basePath: string
  variant: "multiple_choice" | "reading_comprehension"
  exerciseId?: string
  onRemove: () => void
}

export function QuestionCard({
  form,
  questionIndex,
  basePath,
  variant,
  exerciseId = "temp",
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
      image_url: "",
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

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
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
                    placeholder="Descripcion o contexto adicional"
                    className="min-h-[60px] resize-y"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <FormField
              control={form.control}
              name={`${basePath}.${questionIndex}.question_image_url`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <ImageUpload
                    value={field.value ?? ""}
                    onChange={(url) => field.onChange(url || null)}
                    path={`questions/${exerciseId}-${questionIndex}/`}
                    label="Imagen de la pregunta (opcional)"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`${basePath}.${questionIndex}.question_audio_url`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <AudioUpload
                    value={field.value ?? ""}
                    onChange={(url) => field.onChange(url || null)}
                    path={`questions/${exerciseId}-${questionIndex}/`}
                    label="Audio de la pregunta (opcional)"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <>
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

          <div className="flex flex-col sm:flex-row gap-4">
            <FormField
              control={form.control}
              name={`${basePath}.${questionIndex}.question_image_url`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <ImageUpload
                    value={field.value ?? ""}
                    onChange={(url) => field.onChange(url || null)}
                    path={`questions/${exerciseId}-${questionIndex}/`}
                    label="Imagen de la pregunta (opcional)"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`${basePath}.${questionIndex}.question_audio_url`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <AudioUpload
                    value={field.value ?? ""}
                    onChange={(url) => field.onChange(url || null)}
                    path={`questions/${exerciseId}-${questionIndex}/`}
                    label="Audio de la pregunta (opcional)"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      )}

      <div className="space-y-3">
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
          const isCorrect = correctOptionId === actualOptionId
          return (
            <div
              key={optionField.id}
              className={cn(
                "space-y-2 rounded-lg p-3 transition-colors",
                isCorrect
                  ? "bg-green-50 dark:bg-green-950/30"
                  : "bg-muted/40"
              )}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectCorrect(optionIndex)}
                  className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  title="Marcar como correcta"
                >
                  {isCorrect ? (
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

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(optionIndex)}
                  disabled={optionFields.length <= 2}
                  className="shrink-0 text-muted-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <FormField
                control={form.control}
                name={`${optionsPath}.${optionIndex}.image_url`}
                render={({ field }) => (
                  <FormItem className="pl-7">
                    <ImageUpload
                      value={field.value ?? ""}
                      onChange={(url) => field.onChange(url || null)}
                      path={`options/${exerciseId}-${questionIndex}-${optionIndex}/`}
                      label={`Imagen opcion ${optionIndex + 1} (opcional)`}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
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

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onRemove()}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Eliminar pregunta
        </Button>
      </div>
    </div>
  )
}
