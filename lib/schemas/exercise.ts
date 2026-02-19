import { z } from "zod"

const optionalUrl = z
  .string()
  .nullish()
  .transform((val) => (!val ? null : val))
  .pipe(z.string().url("URL invalida").nullable())

const multipleChoiceOptionSchema = z.object({
  id: z.string().uuid(),
  text: z.string().default(""),
  image_url: optionalUrl,
}).refine(
  (data) => data.text.trim().length > 0 || (data.image_url !== null && data.image_url !== undefined),
  { message: "La opcion debe tener texto, imagen o ambos", path: ["text"] }
)

const multipleChoiceQuestionSchema = z
  .object({
    id: z.string().uuid(),
    text: z.string().min(1, "El texto de la pregunta es requerido"),
    description: z.string().nullish().transform(val => !val ? null : val).pipe(z.string().nullable()),
    image_url: optionalUrl,
    audio_url: optionalUrl,
    question_image_url: optionalUrl,
    question_audio_url: optionalUrl,
    options: z
      .array(multipleChoiceOptionSchema)
      .min(2, "Minimo 2 opciones")
      .max(6, "Maximo 6 opciones"),
    correct_option_id: z.string().min(1, "Debes seleccionar la opcion correcta"),
    explanation: z
      .string()
      .nullish()
      .transform((val) => (!val ? null : val))
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
  image_url: optionalUrl,
})

const readingQuestionSchema = z
  .object({
    id: z.string().uuid(),
    text: z.string().min(1, "El texto de la pregunta es requerido"),
    question_image_url: optionalUrl,
    question_audio_url: optionalUrl,
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
  text_difficulty: z.enum(["simple", "moderado", "complejo"]).default("simple"),
  questions: z
    .array(readingQuestionSchema)
    .min(1, "Debes agregar al menos una pregunta"),
})

const timedReadingContentSchema = z.object({
  reading_text: z
    .string()
    .min(10, "El texto debe tener al menos 10 caracteres")
    .max(10000, "El texto no puede exceder 10000 caracteres"),
  reading_audio_url: optionalUrl,
  word_count: z.coerce.number().int().min(1),
  show_timer: z.boolean().default(true),
})

const letterGapSentenceSchema = z.object({
  id: z.string().uuid(),
  full_sentence: z.string().min(1, "La frase completa es requerida"),
  display_sentence: z.string().min(1, "La frase con hueco es requerida"),
  correct_answer: z.string().min(1, "La palabra correcta es requerida"),
  hint: z
    .string()
    .nullish()
    .transform((val) => (!val ? null : val))
    .pipe(z.string().nullable()),
  points: z.coerce.number().int().min(1).default(10),
})

const letterGapContentSchema = z.object({
  reading_text: z
    .string()
    .nullish()
    .transform((val) => (!val ? null : val))
    .pipe(z.string().nullable()),
  reading_audio_url: optionalUrl,
  sentences: z
    .array(letterGapSentenceSchema)
    .min(1, "Debes agregar al menos una frase"),
  distractors: z.array(z.string().min(1)).default([]),
  shuffle_options: z.boolean().default(true),
})

const baseExerciseSchema = z.object({
  title: z
    .string()
    .min(3, "El titulo debe tener al menos 3 caracteres")
    .max(200, "El titulo es demasiado largo"),
  instructions: z.string().min(1, "Las instrucciones son requeridas"),
  instructions_audio_url: optionalUrl,
  difficulty_level: z.coerce.number().int().min(1).max(6),
  estimated_time_seconds: z.coerce.number().int().default(0),
  target_age_min: z.coerce.number().int().min(1).max(100),
  target_age_max: z.coerce.number().int().min(1).max(100),
  exercise_type_id: z.string().uuid("Selecciona un tipo de ejercicio"),
  tags: z.array(z.string().min(1).max(50)).max(10).default([]),
  world_id: z.string().nullable().optional(),
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

const createTimedReadingSchema = baseExerciseSchema
  .extend({
    exercise_type_name: z.literal("timed_reading"),
    content: timedReadingContentSchema,
  })
  .refine((data) => data.target_age_min <= data.target_age_max, {
    message: "La edad minima no puede ser mayor que la maxima",
    path: ["target_age_max"],
  })

const createLetterGapSchema = baseExerciseSchema
  .extend({
    exercise_type_name: z.literal("letter_gap"),
    content: letterGapContentSchema,
  })
  .refine((data) => data.target_age_min <= data.target_age_max, {
    message: "La edad minima no puede ser mayor que la maxima",
    path: ["target_age_max"],
  })

export const createExerciseSchema = z.discriminatedUnion("exercise_type_name", [
  createMultipleChoiceSchema,
  createReadingComprehensionSchema,
  createTimedReadingSchema,
  createLetterGapSchema,
])

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>
export type MultipleChoiceContent = z.infer<typeof multipleChoiceContentSchema>
export type ReadingComprehensionContent = z.infer<typeof readingComprehensionContentSchema>
export type TimedReadingContent = z.infer<typeof timedReadingContentSchema>
export type LetterGapContent = z.infer<typeof letterGapContentSchema>

export {
  multipleChoiceContentSchema,
  readingComprehensionContentSchema,
  timedReadingContentSchema,
  letterGapContentSchema,
  baseExerciseSchema,
}
