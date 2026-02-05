import { z } from "zod"

const optionalUrl = z
  .string()
  .transform((val) => (val === "" ? null : val))
  .pipe(z.string().url("URL invalida").nullable())

const multipleChoiceOptionSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1, "El texto de la opcion es requerido"),
  image_url: optionalUrl,
})

const multipleChoiceQuestionSchema = z
  .object({
    id: z.string().uuid(),
    text: z.string().min(1, "El texto de la pregunta es requerido"),
    image_url: optionalUrl,
    audio_url: optionalUrl,
    options: z
      .array(multipleChoiceOptionSchema)
      .min(2, "Minimo 2 opciones")
      .max(6, "Maximo 6 opciones"),
    correct_option_id: z.string().min(1, "Debes seleccionar la opcion correcta"),
    explanation: z
      .string()
      .transform((val) => (val === "" ? null : val))
      .pipe(z.string().nullable()),
    points: z.coerce.number().int().min(1).default(1),
  })
  .refine(
    (data) => data.options.some((opt) => opt.id === data.correct_option_id),
    { message: "La opcion correcta debe ser una de las opciones", path: ["correct_option_id"] }
  )

const multipleChoiceContentSchema = z.object({
  shuffle_options: z.boolean().default(true),
  shuffle_questions: z.boolean().default(false),
  show_feedback: z.boolean().default(true),
  questions: z
    .array(multipleChoiceQuestionSchema)
    .min(1, "Debes agregar al menos una pregunta"),
})

const readingOptionSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1, "El texto de la opcion es requerido"),
})

const readingQuestionSchema = z
  .object({
    id: z.string().uuid(),
    text: z.string().min(1, "El texto de la pregunta es requerido"),
    type: z.literal("multiple_choice"),
    options: z
      .array(readingOptionSchema)
      .min(2, "Minimo 2 opciones")
      .max(6, "Maximo 6 opciones"),
    correct_option_id: z.string().min(1, "Debes seleccionar la opcion correcta"),
    points: z.coerce.number().int().min(1).default(1),
  })
  .refine(
    (data) => data.options.some((opt) => opt.id === data.correct_option_id),
    { message: "La opcion correcta debe ser una de las opciones", path: ["correct_option_id"] }
  )

const readingComprehensionContentSchema = z.object({
  reading_text: z
    .string()
    .min(10, "El texto debe tener al menos 10 caracteres")
    .max(5000, "El texto no puede exceder 5000 caracteres"),
  reading_audio_url: optionalUrl,
  word_count: z.coerce.number().int().min(1),
  hide_text_during_questions: z.boolean().default(false),
  questions: z
    .array(readingQuestionSchema)
    .min(1, "Debes agregar al menos una pregunta"),
})

const baseExerciseSchema = z.object({
  title: z
    .string()
    .min(3, "El titulo debe tener al menos 3 caracteres")
    .max(200, "El titulo es demasiado largo"),
  instructions: z
    .string()
    .min(10, "Las instrucciones deben tener al menos 10 caracteres"),
  instructions_audio_url: optionalUrl,
  difficulty_level: z.coerce.number().int().min(1).max(5),
  estimated_time_minutes: z.coerce
    .number()
    .int()
    .min(1, "Debe ser al menos 1 minuto")
    .max(180, "Maximo 180 minutos"),
  target_age_min: z.coerce.number().int().min(1).max(100),
  target_age_max: z.coerce.number().int().min(1).max(100),
  exercise_type_id: z.string().uuid("Selecciona un tipo de ejercicio"),
})

const createMultipleChoiceSchema = baseExerciseSchema
  .extend({
    exercise_type_name: z.literal("multiple_choice"),
    content: multipleChoiceContentSchema,
  })
  .refine((data) => data.target_age_min <= data.target_age_max, {
    message: "La edad minima no puede ser mayor que la maxima",
    path: ["target_age_max"],
  })

const createReadingComprehensionSchema = baseExerciseSchema
  .extend({
    exercise_type_name: z.literal("reading_comprehension"),
    content: readingComprehensionContentSchema,
  })
  .refine((data) => data.target_age_min <= data.target_age_max, {
    message: "La edad minima no puede ser mayor que la maxima",
    path: ["target_age_max"],
  })

export const createExerciseSchema = z.discriminatedUnion("exercise_type_name", [
  createMultipleChoiceSchema,
  createReadingComprehensionSchema,
])

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>
export type MultipleChoiceContent = z.infer<typeof multipleChoiceContentSchema>
export type ReadingComprehensionContent = z.infer<typeof readingComprehensionContentSchema>

export {
  multipleChoiceContentSchema,
  readingComprehensionContentSchema,
  baseExerciseSchema,
}
