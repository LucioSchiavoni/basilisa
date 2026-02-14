"use client"

import { useState, useCallback, useRef, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AudioPlayer } from "@/components/ui/audio-player"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  ArrowLeft,
  BookOpen,
  BarChart3,
  CheckCircle2,
  XCircle,
  Trophy,
  ChevronRight,
  Loader2,
  Gem,
  RotateCcw,
} from "lucide-react"
import { checkLetterGapAnswer, completeLetterGap } from "./actions"
import type { LetterGapAnswerResult } from "./actions"

type Sentence = {
  id: string
  display_sentence: string
  correct_answer: string
  hint?: string | null
  points: number
}

type LetterGapContent = {
  reading_text?: string | null
  reading_audio_url?: string | null
  sentences: Sentence[]
  distractors: string[]
  shuffle_options: boolean
}

type LetterGapPlayerProps = {
  exercise: {
    id: string
    title: string
    instructions: string
    instructionsAudioUrl: string | null
    difficultyLevel: number
    content: Record<string, unknown>
    typeName: string
    typeDisplayName: string
  }
}

type Phase = "intro" | "reading" | "playing" | "retry" | "results"

type SentenceStatus = "empty" | "placed" | "correct" | "incorrect"

const difficultyLabels: Record<number, string> = {
  1: "Muy fácil",
  2: "Fácil",
  3: "Intermedio",
  4: "Difícil",
  5: "Muy difícil",
}

const difficultyColors: Record<number, string> = {
  1: "text-green-600",
  2: "text-green-600",
  3: "text-yellow-600",
  4: "text-red-600",
  5: "text-red-600",
}

function getResultMessage(percentage: number): string {
  if (percentage === 100) return "¡Perfecto! Excelente trabajo"
  if (percentage >= 80) return "¡Muy bien! Casi perfecto"
  if (percentage >= 60) return "¡Buen trabajo! Sigue practicando"
  if (percentage >= 40) return "Vas por buen camino, no te rindas"
  return "¡Ánimo! La práctica hace al maestro"
}

function getResultEmoji(percentage: number): string {
  if (percentage === 100) return "🏆"
  if (percentage >= 80) return "🌟"
  if (percentage >= 60) return "💪"
  if (percentage >= 40) return "📚"
  return "🎯"
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function buildOptions(
  sentence: Sentence,
  distractors: string[],
  shouldShuffle: boolean
): string[] {
  const options = [sentence.correct_answer, ...distractors]
  return shouldShuffle ? shuffleArray(options) : options
}

export function LetterGapPlayer({ exercise }: LetterGapPlayerProps) {
  const content = exercise.content as unknown as LetterGapContent
  const sentences = content.sentences || []
  const readingText = content.reading_text || null
  const readingAudioUrl = content.reading_audio_url || null
  const hasReading = !!readingText
  const distractors = content.distractors || []

  const [phase, setPhase] = useState<Phase>("intro")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [placedWord, setPlacedWord] = useState<string | null>(null)
  const [status, setStatus] = useState<SentenceStatus>("empty")
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [options, setOptions] = useState<string[]>(() =>
    sentences.length > 0
      ? buildOptions(sentences[0], distractors, content.shuffle_options)
      : []
  )
  const [correctCount, setCorrectCount] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [earnedPoints, setEarnedPoints] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [gemsAwarded, setGemsAwarded] = useState<number | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const [incorrectIndices, setIncorrectIndices] = useState<number[]>([])
  const [retryPosition, setRetryPosition] = useState(0)

  const answersRef = useRef<LetterGapAnswerResult[]>([])
  const startedAtRef = useRef(0)

  const isRetry = phase === "retry"
  const retryQueue = incorrectIndices
  const activeSentenceIndex = isRetry
    ? retryQueue[retryPosition]
    : currentIndex
  const activeSentence = sentences[activeSentenceIndex]
  const activeTotal = isRetry ? retryQueue.length : sentences.length
  const activePosition = isRetry ? retryPosition : currentIndex
  const isLastInQueue = activePosition === activeTotal - 1

  const isChecked = status === "correct" || status === "incorrect"
  const isCorrect = status === "correct"
  const progress =
    activeTotal > 0
      ? ((activePosition + (isChecked ? 1 : 0)) / activeTotal) * 100
      : 0

  const handleStart = useCallback(() => {
    startedAtRef.current = Date.now()
    if (hasReading) {
      setPhase("reading")
    } else {
      setPhase("playing")
    }
  }, [hasReading])

  const handlePlaceWord = useCallback(
    (word: string) => {
      if (status === "correct" || status === "incorrect") return

      if (placedWord) {
        setOptions((prev) => [...prev, placedWord])
      }

      setPlacedWord(word)
      setStatus("placed")
      setOptions((prev) => {
        const idx = prev.indexOf(word)
        return prev.filter((_, i) => i !== idx)
      })
      setSelectedOption(null)
    },
    [status, placedWord]
  )

  const handleRemoveWord = useCallback(() => {
    if (status !== "placed" || !placedWord) return

    setOptions((prev) => [...prev, placedWord])
    setPlacedWord(null)
    setStatus("empty")
  }, [status, placedWord])

  const handleCheck = useCallback(() => {
    if (status !== "placed" || !placedWord || !activeSentence) return

    startTransition(async () => {
      const result = await checkLetterGapAnswer(
        exercise.id,
        activeSentence.id,
        placedWord
      )

      answersRef.current.push({
        questionId: activeSentence.id,
        patientAnswer: placedWord,
        correctAnswer: result.correctAnswer,
        isCorrect: result.isCorrect,
      })

      const pts = activeSentence.points || 10

      if (result.isCorrect) {
        setCorrectCount((c) => c + 1)
        setEarnedPoints((p) => p + pts)
        setStatus("correct")
      } else {
        setStatus("incorrect")
      }

      if (!isRetry) {
        setTotalPoints((p) => p + pts)
        if (!result.isCorrect) {
          setIncorrectIndices((prev) => [...prev, activeSentenceIndex])
        }
      }
    })
  }, [status, placedWord, activeSentence, exercise.id, isRetry, activeSentenceIndex])

  const finishExercise = useCallback(() => {
    setPhase("results")
    setIsCompleting(true)
    const durationSeconds = Math.round(
      (Date.now() - startedAtRef.current) / 1000
    )
    const currentAnswers = answersRef.current
    completeLetterGap({
      exerciseId: exercise.id,
      answers: currentAnswers,
      totalSentences: sentences.length,
      correctAnswers: currentAnswers.filter((a) => a.isCorrect).length,
      durationSeconds,
    })
      .then((result) => setGemsAwarded(result.gemsAwarded))
      .catch(() => setGemsAwarded(0))
      .finally(() => setIsCompleting(false))
  }, [exercise.id, sentences.length])

  const resetForSentence = useCallback(
    (sentenceIdx: number) => {
      setPlacedWord(null)
      setStatus("empty")
      setSelectedOption(null)
      setShowHint(false)
      setOptions(
        buildOptions(sentences[sentenceIdx], distractors, content.shuffle_options)
      )
    },
    [sentences, distractors, content.shuffle_options]
  )

  const handleNext = useCallback(() => {
    if (isLastInQueue) {
      if (!isRetry && incorrectIndices.length > 0) {
        setRetryPosition(0)
        setPhase("retry")
        resetForSentence(incorrectIndices[0])
      } else {
        finishExercise()
      }
    } else {
      const nextPos = activePosition + 1
      if (isRetry) {
        setRetryPosition(nextPos)
        resetForSentence(retryQueue[nextPos])
      } else {
        setCurrentIndex(nextPos)
        resetForSentence(nextPos)
      }
    }
  }, [
    isLastInQueue,
    isRetry,
    incorrectIndices,
    activePosition,
    retryQueue,
    resetForSentence,
    finishExercise,
  ])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const word = e.dataTransfer.getData("text/plain")
      if (word) handlePlaceWord(word)
    },
    [handlePlaceWord]
  )

  const handleTapSlot = useCallback(() => {
    if (status === "correct" || status === "incorrect") return

    if (status === "placed") {
      handleRemoveWord()
      return
    }

    if (selectedOption) {
      handlePlaceWord(selectedOption)
    }
  }, [status, selectedOption, handlePlaceWord, handleRemoveWord])

  if (phase === "intro") {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="p-4">
          <Link
            href="/ejercicios/todos"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-lg text-center space-y-8">
            <div className="space-y-3">
              <Badge variant="outline" className="text-xs">
                {exercise.typeDisplayName}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {exercise.title}
              </h1>
              <p className="text-muted-foreground">{exercise.instructions}</p>
              {exercise.instructionsAudioUrl && (
                <div className="mt-4">
                  <AudioPlayer src={exercise.instructionsAudioUrl} />
                </div>
              )}
            </div>

            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <span
                className={cn(
                  "flex items-center gap-1.5",
                  difficultyColors[exercise.difficultyLevel]
                )}
              >
                <BarChart3 className="h-4 w-4" />
                {difficultyLabels[exercise.difficultyLevel]}
              </span>
              <span className="flex items-center gap-1.5">
                {sentences.length} frase{sentences.length !== 1 && "s"}
              </span>
            </div>

            <Button
              size="lg"
              className="w-full max-w-xs text-base h-12"
              onClick={handleStart}
            >
              Comenzar
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (phase === "reading") {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b p-4">
          <div className="max-w-lg mx-auto">
            <p className="text-sm font-medium text-center text-muted-foreground">
              Lee el siguiente texto con atención
            </p>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-lg mx-auto">
            {readingAudioUrl && (
              <div className="mb-4">
                <AudioPlayer src={readingAudioUrl} />
              </div>
            )}
            <article className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                {readingText}
              </p>
            </article>
          </div>
        </main>

        <footer className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4">
          <div className="max-w-lg mx-auto">
            <Button
              size="lg"
              className="w-full text-base h-12"
              onClick={() => setPhase("playing")}
            >
              Continuar a las frases
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        </footer>
      </div>
    )
  }

  if (phase === "results") {
    const percentage =
      sentences.length > 0
        ? Math.round((correctCount / sentences.length) * 100)
        : 0

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-lg text-center space-y-8">
          <div className="text-6xl">{getResultEmoji(percentage)}</div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold">
              {getResultMessage(percentage)}
            </h1>
            <p className="text-muted-foreground">{exercise.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-muted p-4 space-y-1">
              <p className="text-3xl font-bold">{percentage}%</p>
              <p className="text-xs text-muted-foreground">Aciertos</p>
            </div>
            <div className="rounded-2xl bg-muted p-4 space-y-1">
              <p className="text-3xl font-bold">
                {correctCount}/{sentences.length}
              </p>
              <p className="text-xs text-muted-foreground">Correctas</p>
            </div>
          </div>

          {totalPoints > 0 && (
            <div className="rounded-2xl bg-muted p-4">
              <p className="text-2xl font-bold">
                <Trophy className="inline h-5 w-5 mr-1 text-yellow-500" />
                {earnedPoints} / {totalPoints} puntos
              </p>
            </div>
          )}

          <div className="rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border border-yellow-200 dark:border-yellow-800 p-4">
            {isCompleting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                <p className="text-sm text-muted-foreground">
                  Calculando gemas...
                </p>
              </div>
            ) : gemsAwarded && gemsAwarded > 0 ? (
              <p className="text-2xl font-bold text-center">
                <Gem className="inline h-5 w-5 mr-1 text-yellow-500" />
                +{gemsAwarded} gemas
              </p>
            ) : (
              <p className="text-sm text-center text-muted-foreground">
                Sin gemas esta vez
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button size="lg" className="w-full text-base h-12" asChild>
              <Link href="/ejercicios/todos">Volver a ejercicios</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const parts = activeSentence.display_sentence.split("_______")

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-lg mx-auto p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Link
              href="/ejercicios/todos"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Salir del ejercicio"
            >
              <XCircle className="h-6 w-6" />
            </Link>
            <div className="flex items-center gap-3">
              {hasReading && (
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-sm font-medium hover:bg-primary/20 active:scale-95 transition-all"
                      aria-label="Ver texto de lectura"
                    >
                      <BookOpen className="h-4 w-4" />
                      Ver texto
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Texto de lectura</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      <p className="text-base leading-relaxed whitespace-pre-wrap">
                        {readingText}
                      </p>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
              <span className="text-sm text-muted-foreground">
                {activePosition + 1} / {activeTotal}
              </span>
            </div>
          </div>

          {isRetry && (
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
              <RotateCcw className="h-4 w-4" />
              Corrige las incorrectas
            </div>
          )}

          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                isRetry ? "bg-amber-500" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-lg mx-auto space-y-6">
          <div
            className={cn(
              "rounded-xl border-2 p-6 transition-all duration-300",
              status === "correct" &&
                "border-green-500 bg-green-50 dark:bg-green-950/30",
              status === "incorrect" &&
                "border-red-500 bg-red-50 dark:bg-red-950/30",
              status === "placed" &&
                "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
              status === "empty" && "border-border"
            )}
            onDragOver={(e) => {
              if (isChecked) return
              e.preventDefault()
              e.dataTransfer.dropEffect = "move"
            }}
            onDrop={handleDrop}
            onClick={handleTapSlot}
          >
            <p className="text-lg sm:text-xl leading-relaxed inline">
              {parts[0]}
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[100px] h-10 mx-1 rounded-lg border-2 border-dashed px-4 text-center font-semibold transition-all align-middle",
                  status === "empty" &&
                    "border-muted-foreground/30 text-muted-foreground/50",
                  status === "placed" &&
                    "border-blue-400 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 cursor-pointer",
                  status === "correct" &&
                    "border-green-500 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-solid",
                  status === "incorrect" &&
                    "border-red-500 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-solid"
                )}
              >
                {placedWord || "___"}
                {status === "correct" && (
                  <CheckCircle2 className="h-4 w-4 ml-1.5 inline" />
                )}
                {status === "incorrect" && (
                  <XCircle className="h-4 w-4 ml-1.5 inline" />
                )}
              </span>
              {parts[1]}
            </p>
          </div>

          {isChecked && (
            <div
              className={cn(
                "rounded-xl p-4 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300",
                isCorrect
                  ? "bg-green-50 border border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300"
                  : "bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300"
              )}
            >
              <p className="font-semibold">
                {isCorrect ? "¡Correcto!" : "Incorrecto"}
              </p>
              {!isCorrect && (
                <p className="text-xs opacity-80 mt-1">
                  La respuesta correcta era: {activeSentence.correct_answer}
                </p>
              )}
            </div>
          )}

          {activeSentence.hint && !isChecked && showHint && (
            <p className="text-sm text-muted-foreground text-center">
              Pista: {activeSentence.hint}
            </p>
          )}

          {activeSentence.hint && !isChecked && !showHint && (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto block"
            >
              Ver pista
            </button>
          )}
        </div>
      </main>

      <footer className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4">
        <div className="max-w-lg mx-auto space-y-3">
          {!isChecked && (
            <>
              {selectedOption && (
                <p className="text-xs text-center text-muted-foreground">
                  Toca la frase para colocar &quot;{selectedOption}&quot;
                </p>
              )}

              <div className="flex flex-wrap gap-2 justify-center min-h-[48px]">
                {options.map((word, index) => (
                  <button
                    key={`${word}-${index}`}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", word)
                      e.dataTransfer.effectAllowed = "move"
                    }}
                    onClick={() =>
                      setSelectedOption((prev) =>
                        prev === word ? null : word
                      )
                    }
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium border-2 transition-all",
                      "active:scale-95 cursor-grab active:cursor-grabbing select-none",
                      "hover:shadow-md",
                      selectedOption === word
                        ? "border-primary bg-primary text-primary-foreground shadow-md scale-105"
                        : "border-border bg-background hover:border-foreground/30"
                    )}
                  >
                    {word}
                  </button>
                ))}
              </div>

              <Button
                size="lg"
                className="w-full text-base h-12"
                disabled={status !== "placed" || isPending}
                onClick={handleCheck}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar"
                )}
              </Button>
            </>
          )}

          {isChecked && (
            <Button
              size="lg"
              className="w-full text-base h-12"
              onClick={handleNext}
            >
              {isLastInQueue && !isRetry && incorrectIndices.length > 0
                ? "Corregir incorrectas"
                : isLastInQueue
                  ? "Ver resultados"
                  : "Siguiente"}
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
