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
import { Form } from "@/components/ui/form"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { StepIndicator } from "@/components/admin/step-indicator"
import { GeneralDataSection } from "./general-data-section"
import { MultipleChoiceEditor } from "./multiple-choice-editor"
import { ReadingComprehensionEditor } from "./reading-comprehension-editor"
import { TimedReadingEditor } from "./timed-reading-editor"
import { LetterGapEditor } from "./letter-gap-editor"
import type { ExerciseType } from "@/types/exercises"

interface CreateExerciseFormProps {
  exerciseTypes: ExerciseType[]
}

const steps = [
  { label: "Datos generales" },
  { label: "Contenido" },
]

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
    text_difficulty: "simple" as const,
    questions: [],
  },
}

const timedReadingDefaults = {
  exercise_type_name: "timed_reading" as const,
  content: {
    reading_text: "",
    reading_audio_url: "",
    word_count: 0,
    show_timer: true,
  },
}

const letterGapDefaults = {
  exercise_type_name: "letter_gap" as const,
  content: {
    reading_text: null,
    reading_audio_url: null,
    sentences: [],
    distractors: [],
    shuffle_options: true,
  },
}

export function CreateExerciseForm({ exerciseTypes }: CreateExerciseFormProps) {
  const [status, setStatus] = useState<{ error?: string; success?: string }>({})
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()
  const prevTypeId = useRef("")

  const form = useForm<CreateExerciseInput>({
    resolver: zodResolver(createExerciseSchema) as Resolver<CreateExerciseInput>,
    defaultValues: {
      title: "",
      instructions: "",
      instructions_audio_url: "",
      difficulty_level: 1,
      estimated_time_seconds: 0,
      target_age_min: 5,
      target_age_max: 12,
      exercise_type_id: "",
      tags: [],
      world_id: "medieval",
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
    } else if (type.name === "timed_reading") {
      form.setValue("exercise_type_name", timedReadingDefaults.exercise_type_name)
      form.setValue("content", timedReadingDefaults.content as CreateExerciseInput["content"])
    } else if (type.name === "letter_gap") {
      form.setValue("exercise_type_name", letterGapDefaults.exercise_type_name)
      form.setValue("content", letterGapDefaults.content as CreateExerciseInput["content"])
    }
  }, [selectedTypeId, exerciseTypes, form])

  async function handleNext() {
    const valid = await form.trigger([
      "title",
      "instructions",
      "difficulty_level",
      "target_age_min",
      "target_age_max",
      "exercise_type_id",
    ])
    if (valid) {
      setStatus({})
      setCurrentStep(1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

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

  function onInvalid(errors: Record<string, unknown>) {
    const generalFields = [
      "title", "instructions", "difficulty_level",
      "target_age_min", "target_age_max", "exercise_type_id", "tags",
    ]
    const hasGeneralError = generalFields.some((f) => f in errors)
    if (hasGeneralError) {
      setCurrentStep(0)
    }

    const firstKey = Object.keys(errors)[0]
    const firstError = errors[firstKey] as { message?: string } | undefined
    setStatus({
      error: firstError?.message || "Revisa los campos del formulario",
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
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

        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={(index) => {
            if (index < currentStep) setCurrentStep(index)
          }}
        />

        {currentStep === 0 && (
          <>
            <GeneralDataSection
              form={form}
              exerciseTypes={exerciseTypes}
            />
            <Button
              type="button"
              className="w-full"
              onClick={handleNext}
              disabled={!selectedTypeId}
            >
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}

        {currentStep === 1 && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep(0)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver a datos generales
            </Button>

            {typeName === "multiple_choice" && (
              <MultipleChoiceEditor form={form} />
            )}
            {typeName === "reading_comprehension" && (
              <ReadingComprehensionEditor form={form} />
            )}
            {typeName === "timed_reading" && (
              <>
                <TimedReadingEditor form={form} />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Creando..." : "Guardar ejercicio"}
                </Button>
              </>
            )}
            {typeName === "letter_gap" && (
              <LetterGapEditor form={form} />
            )}
          </>
        )}
      </form>
    </Form>
  )
}
