"use client"

import { useState, useEffect, useRef } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import {
  createExerciseSchema,
  type CreateExerciseInput,
} from "@/lib/schemas/exercise"
import { createExercise } from "../../actions"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Form } from "@/components/ui/form"
import { GeneralDataSection } from "./general-data-section"
import { MultipleChoiceEditor } from "./multiple-choice-editor"
import { ReadingComprehensionEditor } from "./reading-comprehension-editor"
import type { ExerciseType } from "@/types/exercises"

interface CreateExerciseFormProps {
  exerciseTypes: ExerciseType[]
}

const multipleChoiceDefaults = {
  exercise_type_name: "multiple_choice" as const,
  content: {
    shuffle_options: true,
    shuffle_questions: false,
    show_feedback: true,
    questions: [],
  },
}

const readingComprehensionDefaults = {
  exercise_type_name: "reading_comprehension" as const,
  content: {
    reading_text: "",
    reading_audio_url: "",
    word_count: 0,
    hide_text_during_questions: false,
    questions: [],
  },
}

export function CreateExerciseForm({ exerciseTypes }: CreateExerciseFormProps) {
  const [status, setStatus] = useState<{ error?: string; success?: string }>({})
  const router = useRouter()
  const prevTypeId = useRef("")

  const form = useForm<CreateExerciseInput>({
    resolver: zodResolver(createExerciseSchema) as Resolver<CreateExerciseInput>,
    defaultValues: {
      title: "",
      instructions: "",
      instructions_audio_url: "",
      difficulty_level: 1,
      estimated_time_minutes: 10,
      target_age_min: 5,
      target_age_max: 12,
      exercise_type_id: "",
      ...multipleChoiceDefaults,
    },
  })

  const selectedTypeId = form.watch("exercise_type_id")
  const selectedType = exerciseTypes.find((t) => t.id === selectedTypeId)
  const typeName = selectedType?.name

  useEffect(() => {
    if (!selectedTypeId || selectedTypeId === prevTypeId.current) return
    prevTypeId.current = selectedTypeId

    const type = exerciseTypes.find((t) => t.id === selectedTypeId)
    if (!type) return

    if (type.name === "multiple_choice") {
      form.setValue("exercise_type_name", multipleChoiceDefaults.exercise_type_name)
      form.setValue("content", multipleChoiceDefaults.content as CreateExerciseInput["content"])
    } else if (type.name === "reading_comprehension") {
      form.setValue("exercise_type_name", readingComprehensionDefaults.exercise_type_name)
      form.setValue("content", readingComprehensionDefaults.content as CreateExerciseInput["content"])
    }
  }, [selectedTypeId, exerciseTypes, form])

  async function onSubmit(data: CreateExerciseInput) {
    setStatus({})
    const result = await createExercise(data)
    if (result.error) {
      setStatus({ error: result.error })
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      setStatus({ success: result.success })
      router.push("/admin/ejercicios")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
          {form.formState.isSubmitting ? "Creando..." : "Crear Ejercicio"}
        </Button>
      </form>
    </Form>
  )
}
