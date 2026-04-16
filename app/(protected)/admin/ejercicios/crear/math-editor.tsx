"use client"

import { useState } from "react"
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
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageUpload } from "@/components/admin/image-upload"

interface MathEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  exerciseId?: string
}

export function MathEditor({ form, exerciseId }: MathEditorProps) {
  const [activeQuestion, setActiveQuestion] = useState(0)

  const {
    fields: blockFields,
    append: appendBlock,
    remove: removeBlock,
  } = useFieldArray({ control: form.control, name: "content.instruction_blocks" })

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({ control: form.control, name: "content.questions" })

  function handleAddBlock(type: "text" | "image") {
    appendBlock({ id: crypto.randomUUID(), type, content: "" })
  }

  function handleAddQuestion() {
    appendQuestion({
      id: crypto.randomUUID(),
      stimulus_text: "",
      stimulus_image_url: null,
      answer_type: "number_gap_input",
      expression: null,
      correct_answer: "",
      options: null,
      points: 1,
    })
    setActiveQuestion(questionFields.length)
  }

  function handleRemoveQuestion(index: number) {
    removeQuestion(index)
    setActiveQuestion((prev) => Math.min(prev, Math.max(questionFields.length - 2, 0)))
  }

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold">Contenido: Matemática</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel className="text-base">Bloques de consigna</FormLabel>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => handleAddBlock("text")}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Texto
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => handleAddBlock("image")}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Imagen
            </Button>
          </div>
        </div>

        <FormField
          control={form.control}
          name="content.instruction_blocks"
          render={() => (
            <FormItem>
              <FormMessage />
            </FormItem>
          )}
        />

        {blockFields.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
            Agrega al menos un bloque de consigna para el ejercicio
          </p>
        )}

        {blockFields.map((block, index) => (
          <div key={block.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {(form.watch(`content.instruction_blocks.${index}.type`) as string) === "image"
                  ? "Imagen"
                  : "Texto"}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => removeBlock(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {(form.watch(`content.instruction_blocks.${index}.type`) as string) === "text" ? (
              <FormField
                control={form.control}
                name={`content.instruction_blocks.${index}.content`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Escribe la consigna del ejercicio..."
                        className="min-h-[80px] resize-y"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name={`content.instruction_blocks.${index}.content`}
                render={({ field }) => (
                  <FormItem>
                    <ImageUpload
                      value={field.value ?? ""}
                      onChange={(url) => field.onChange(url || "")}
                      path={`math/${exerciseId ?? "temp"}/blocks/${index}/`}
                      label="Imagen de la consigna"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel className="text-base">Preguntas</FormLabel>
          <Button type="button" variant="outline" size="sm" onClick={handleAddQuestion}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Agregar pregunta
          </Button>
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

        {questionFields.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
            Agrega al menos una pregunta
          </p>
        )}

        {questionFields.length > 0 && (
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
                Pregunta {activeQuestion + 1} de {questionFields.length}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setActiveQuestion((i) => i + 1)}
                disabled={activeQuestion >= questionFields.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {questionFields.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {questionFields.map((_, i) => (
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

            <MathQuestionCard
              key={questionFields[activeQuestion]?.id}
              form={form}
              questionIndex={activeQuestion}
              exerciseId={exerciseId}
              onRemove={() => handleRemoveQuestion(activeQuestion)}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Guardando..." : "Guardar ejercicio"}
        </Button>
      </div>
    </div>
  )
}

function MathQuestionCard({
  form,
  questionIndex,
  exerciseId,
  onRemove,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  questionIndex: number
  exerciseId?: string
  onRemove: () => void
}) {
  const [optionInput, setOptionInput] = useState("")
  const basePath = `content.questions.${questionIndex}`
  const answerType = form.watch(`${basePath}.answer_type`) as string
  const options = (form.watch(`${basePath}.options`) as string[] | null) || []

  const needsExpression = answerType === "number_gap_options" || answerType === "number_gap_input"
  const needsOptions = answerType === "number_gap_options" || answerType === "multiple_choice"

  function handleAddOption(value: string) {
    const opt = value.trim()
    if (!opt || options.includes(opt)) return
    form.setValue(`${basePath}.options`, [...options, opt], { shouldValidate: true })
  }

  function handleRemoveOption(index: number) {
    form.setValue(
      `${basePath}.options`,
      options.filter((_, i) => i !== index),
      { shouldValidate: true }
    )
  }

  function handleOptionKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      handleAddOption(optionInput)
      setOptionInput("")
    }
  }

  function handleAnswerTypeChange(value: string) {
    form.setValue(`${basePath}.answer_type`, value, { shouldValidate: true })
    if (value === "number_gap_input") {
      form.setValue(`${basePath}.options`, null, { shouldValidate: false })
    }
    if (value !== "number_gap_options" && value !== "number_gap_input") {
      form.setValue(`${basePath}.expression`, null, { shouldValidate: false })
    }
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <FormField
        control={form.control}
        name={`${basePath}.stimulus_text`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Enunciado de la pregunta</FormLabel>
            <FormControl>
              <Textarea
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value || null)}
                placeholder="Ej: ¿Cuánto es 3 + 4?"
                className="min-h-[80px] resize-y"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`${basePath}.stimulus_image_url`}
        render={({ field }) => (
          <FormItem>
            <ImageUpload
              value={field.value ?? ""}
              onChange={(url) => field.onChange(url || null)}
              path={`math/${exerciseId ?? "temp"}/questions/${questionIndex}/`}
              label="Imagen del enunciado (opcional)"
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`${basePath}.answer_type`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de respuesta</FormLabel>
            <Select
              value={field.value as string}
              onValueChange={handleAnswerTypeChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="number_gap_input">Completar con número (libre)</SelectItem>
                <SelectItem value="number_gap_options">Completar con número (opciones)</SelectItem>
                <SelectItem value="multiple_choice">Opción múltiple</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {needsExpression && (
        <FormField
          control={form.control}
          name={`${basePath}.expression`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expresión matemática</FormLabel>
              <FormDescription>
                Usa [?] para marcar el hueco que el paciente debe completar. Ej: 3 + [?] = 7
              </FormDescription>
              <FormControl>
                <Input
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                  placeholder="Ej: 3 + [?] = 7"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name={`${basePath}.correct_answer`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Respuesta correcta</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ej: 4" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {needsOptions && (
        <div className="space-y-2">
          <FormLabel>Opciones</FormLabel>
          <FormDescription>
            Escribe cada opción y presiona Enter o coma para agregarla
          </FormDescription>
          <div className="flex flex-wrap gap-2 min-h-[40px] rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            {options.map((opt, i) => (
              <Badge key={i} variant="secondary" className="gap-1">
                {opt}
                <button
                  type="button"
                  onClick={() => handleRemoveOption(i)}
                  className="ml-0.5 rounded-full hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <input
              type="text"
              value={optionInput}
              onChange={(e) => setOptionInput(e.target.value)}
              onKeyDown={handleOptionKeyDown}
              onBlur={() => {
                if (optionInput.trim()) {
                  handleAddOption(optionInput)
                  setOptionInput("")
                }
              }}
              placeholder={options.length === 0 ? "Escribe opciones y presiona Enter" : ""}
              className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <FormField
            control={form.control}
            name={`${basePath}.options`}
            render={() => (
              <FormItem>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <FormField
        control={form.control}
        name={`${basePath}.points`}
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

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Eliminar pregunta
        </Button>
      </div>
    </div>
  )
}
