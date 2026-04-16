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
  audio_label: z.string().nullish().transform((val) => (!val ? null : val)).pipe(z.string().nullable()),
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

const mathInstructionBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["text", "image"]),
  content: z.string().min(1),
})

const mathQuestionSchema = z.object({
  id: z.string().uuid(),
  stimulus_text: z.string().nullish().transform(v => !v ? null : v).pipe(z.string().nullable()),
  stimulus_image_url: optionalUrl,
  answer_type: z.enum(["number_gap_options", "number_gap_input", "multiple_choice"]),
  expression: z.string().nullish().transform(v => !v ? null : v).pipe(z.string().nullable()),
  correct_answer: z.string().min(1, "La respuesta correcta es requerida"),
  options: z.array(z.string().min(1)).nullish().transform(v => !v ? null : v).pipe(z.array(z.string()).nullable()),
  points: z.coerce.number().int().min(1).default(1),
}).refine(
  (data) => data.stimulus_text !== null || data.stimulus_image_url !== null,
  { message: "La pregunta debe tener texto o imagen", path: ["stimulus_text"] }
).refine(
  (data) => {
    if (data.answer_type === "number_gap_options" || data.answer_type === "multiple_choice") {
      return Array.isArray(data.options) && data.options.length >= 2
    }
    return true
  },
  { message: "Este tipo requiere al menos 2 opciones", path: ["options"] }
).refine(
  (data) => {
    if (data.answer_type === "number_gap_options" || data.answer_type === "number_gap_input") {
      return typeof data.expression === "string" && data.expression.includes("[?]")
    }
    return true
  },
  { message: "La expresión debe contener [?] para marcar el hueco", path: ["expression"] }
)

const mathContentSchema = z.object({
  instruction_blocks: z.array(mathInstructionBlockSchema).min(1, "Agregá al menos un bloque de consigna"),
  questions: z.array(mathQuestionSchema).min(1, "Agregá al menos una pregunta"),
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
  exercise_type_id: z.string().uuid("Selecciona un tipo de ejercicio"),
  tags: z.array(z.string().min(1).max(50)).max(10).default([]),
  world_id: z.string().nullable().optional(),
})

const createMultipleChoiceSchema = baseExerciseSchema.extend({
  exercise_type_name: z.literal("multiple_choice"),
  content: multipleChoiceContentSchema,
})

const createReadingComprehensionSchema = baseExerciseSchema.extend({
  exercise_type_name: z.literal("reading_comprehension"),
  content: readingComprehensionContentSchema,
})

const createTimedReadingSchema = baseExerciseSchema.extend({
  exercise_type_name: z.literal("timed_reading"),
  content: timedReadingContentSchema,
})

const createLetterGapSchema = baseExerciseSchema.extend({
  exercise_type_name: z.literal("letter_gap"),
  content: letterGapContentSchema,
})

const createMathSchema = baseExerciseSchema.extend({
  exercise_type_name: z.literal("math"),
  instructions: z.string().optional().nullable().transform(v => v ?? null),
  content: mathContentSchema,
})

export const createExerciseSchema = z.discriminatedUnion("exercise_type_name", [
  createMultipleChoiceSchema,
  createReadingComprehensionSchema,
  createTimedReadingSchema,
  createLetterGapSchema,
  createMathSchema,
])

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>
export type MultipleChoiceContent = z.infer<typeof multipleChoiceContentSchema>
export type ReadingComprehensionContent = z.infer<typeof readingComprehensionContentSchema>
export type TimedReadingContent = z.infer<typeof timedReadingContentSchema>
export type LetterGapContent = z.infer<typeof letterGapContentSchema>
export type MathContent = z.infer<typeof mathContentSchema>
export type MathQuestion = z.infer<typeof mathQuestionSchema>
export type MathInstructionBlock = z.infer<typeof mathInstructionBlockSchema>

export {
  multipleChoiceContentSchema,
  readingComprehensionContentSchema,
  timedReadingContentSchema,
  letterGapContentSchema,
  mathContentSchema,
  baseExerciseSchema,
}
