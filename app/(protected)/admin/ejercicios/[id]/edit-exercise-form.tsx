"use client"

import { useState, useEffect, useRef } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import {
  createExerciseSchema,
  type CreateExerciseInput,
} from "@/lib/schemas/exercise"
import { updateExercise } from "../../actions"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Form } from "@/components/ui/form"
import { GeneralDataSection } from "../crear/general-data-section"
import { MultipleChoiceEditor } from "../crear/multiple-choice-editor"
import { ReadingComprehensionEditor } from "../crear/reading-comprehension-editor"
import type { ExerciseType } from "@/types/exercises"
import type { Json } from "@/types/database.types"

interface EditExerciseFormProps {
  exercise: {
    id: string
    title: string
    instructions: string
    instructions_audio_url: string | null
    difficulty_level: number
    estimated_time_seconds: number
    target_age_min: number
    target_age_max: number
    exercise_type_id: string
    content: Json
    exercise_types: { name: string; display_name: string } | null
  }
  exerciseTypes: ExerciseType[]
}

export function EditExerciseForm({
  exercise,
  exerciseTypes,
}: EditExerciseFormProps) {
  const [status, setStatus] = useState<{ error?: string; success?: string }>({})
  const router = useRouter()
  const prevTypeId = useRef(exercise.exercise_type_id)
  const initialTypeId = useRef(exercise.exercise_type_id)

  const exerciseTypeName = exercise.exercise_types?.name as
    | "multiple_choice"
    | "reading_comprehension"

  const form = useForm<CreateExerciseInput>({
    resolver: zodResolver(createExerciseSchema) as Resolver<CreateExerciseInput>,
    defaultValues: {
      title: exercise.title,
      instructions: exercise.instructions,
      instructions_audio_url: exercise.instructions_audio_url,
      difficulty_level: exercise.difficulty_level,
      estimated_time_seconds: exercise.estimated_time_seconds,
      target_age_min: exercise.target_age_min,
      target_age_max: exercise.target_age_max,
      exercise_type_id: exercise.exercise_type_id,
      exercise_type_name: exerciseTypeName,
      content: exercise.content as CreateExerciseInput["content"],
    },
  })

  const selectedTypeId = form.watch("exercise_type_id")
  const selectedType = exerciseTypes.find((t) => t.id === selectedTypeId)
  const typeName = selectedType?.name

  useEffect(() => {
    if (!selectedTypeId || selectedTypeId === prevTypeId.current) return
    prevTypeId.current = selectedTypeId

    if (selectedTypeId === initialTypeId.current) return

    const type = exerciseTypes.find((t) => t.id === selectedTypeId)
    if (!type) return

    if (type.name === "multiple_choice") {
      form.setValue("exercise_type_name", "multiple_choice")
      form.setValue("content", {
        shuffle_options: true,
        shuffle_questions: false,
        show_feedback: true,
        questions: [],
      } as CreateExerciseInput["content"])
    } else if (type.name === "reading_comprehension") {
      form.setValue("exercise_type_name", "reading_comprehension")
      form.setValue("content", {
        reading_text: "",
        reading_audio_url: "",
        word_count: 0,
        hide_text_during_questions: false,
        questions: [],
      } as CreateExerciseInput["content"])
    }
  }, [selectedTypeId, exerciseTypes, form])

  async function onSubmit(data: CreateExerciseInput) {
    setStatus({})
    const result = await updateExercise(exercise.id, data)
    if (result.error) {
      setStatus({ error: result.error })
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      setStatus({ success: result.success })
      router.push("/admin/ejercicios")
    }
  }

  function onInvalid(errors: Record<string, unknown>) {
    const firstKey = Object.keys(errors)[0]
    const firstError = errors[firstKey] as { message?: string } | undefined
    setStatus({
      error: firstError?.message || "Revisa los campos del formulario",
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8">
        {status.error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md dark:bg-red-900/20">
            {status.error}
          </div>
        )}
        {status.success && (
          <div className="p-3 text-sm text-green-500 bg-green-50 rounded-md dark:bg-green-900/20">
            {status.success}
          </div>
        )}

        <GeneralDataSection form={form} exerciseTypes={exerciseTypes} />

        {typeName && (
          <>
            <Separator />
            {typeName === "multiple_choice" && (
              <MultipleChoiceEditor form={form} />
            )}
            {typeName === "reading_comprehension" && (
              <ReadingComprehensionEditor form={form} />
            )}
          </>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </form>
    </Form>
  )
}
