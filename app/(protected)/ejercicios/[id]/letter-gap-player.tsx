"use client"

import { useState, useCallback, useRef, useTransition, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
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
  RotateCcw,
} from "lucide-react"
import { GemIcon } from "@/components/gem-icon"
import { WorldUnlockNotification } from "@/components/world-unlock-notification"
import { checkLetterGapAnswer, completeLetterGap } from "./actions"
import type { LetterGapAnswerResult } from "./actions"
import { getScheme } from "@/app/(protected)/ejercicios/(browse)/mundos/world-color-schemes"
import { getWorldConfig } from "@/lib/worlds"

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
  worldId?: string
  worldName?: string
  backHref: string
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

export function LetterGapPlayer({ exercise, worldId, worldName, backHref }: LetterGapPlayerProps) {
  const content = exercise.content as unknown as LetterGapContent
  const sentences = content.sentences || []
  const worldScheme = worldName ? getScheme(worldName) : null
  const worldConfig = worldName ? getWorldConfig(worldName) : null
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
  const [unlockedWorld, setUnlockedWorld] = useState<{ name: string; displayName: string } | null>(null)
  const [showHint, setShowHint] = useState(false)

  const [incorrectIndices, setIncorrectIndices] = useState<number[]>([])
  const [retryPosition, setRetryPosition] = useState(0)
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null)

  const answersRef = useRef<LetterGapAnswerResult[]>([])
  const startedAtRef = useRef(0)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const ghostRef = useRef<HTMLDivElement | null>(null)
  const draggingWordRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (ghostRef.current) {
        document.body.removeChild(ghostRef.current)
        ghostRef.current = null
      }
    }
  }, [])

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
        if (!isRetry) {
          setCorrectCount((c) => c + 1)
          setEarnedPoints((p) => p + pts)
        }
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
      .then((result) => {
        setGemsAwarded(result.gemsAwarded)
        if (result.unlockedWorld) setUnlockedWorld(result.unlockedWorld)
      })
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

  const handleTouchStartDrag = useCallback(
    (e: React.TouchEvent, word: string) => {
      if (isChecked) return
      draggingWordRef.current = word
      const touch = e.touches[0]
      const ghost = document.createElement("div")
      ghost.textContent = word
      ghost.style.cssText = `
        position: fixed;
        top: ${touch.clientY - 22}px;
        left: ${touch.clientX - 50}px;
        padding: 6px 16px;
        background: hsl(221.2 83.2% 53.3%);
        color: white;
        border-radius: 9999px;
        font-size: 14px;
        font-weight: 500;
        pointer-events: none;
        z-index: 9999;
        opacity: 0.9;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      `
      document.body.appendChild(ghost)
      ghostRef.current = ghost
    },
    [isChecked]
  )

  const handleTouchMoveDrag = useCallback((e: React.TouchEvent) => {
    if (!ghostRef.current || !draggingWordRef.current) return
    e.preventDefault()
    const touch = e.touches[0]
    ghostRef.current.style.top = `${touch.clientY - 22}px`
    ghostRef.current.style.left = `${touch.clientX - 50}px`

    if (dropZoneRef.current) {
      const rect = dropZoneRef.current.getBoundingClientRect()
      const isOver =
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      dropZoneRef.current.style.outline = isOver ? "2px solid rgb(59 130 246)" : ""
    }
  }, [])

  const handleTouchEndDrag = useCallback(
    (e: React.TouchEvent, word: string) => {
      if (!ghostRef.current) return
      const touch = e.changedTouches[0]
      document.body.removeChild(ghostRef.current)
      ghostRef.current = null
      draggingWordRef.current = null

      if (dropZoneRef.current) {
        dropZoneRef.current.style.outline = ""
      }

      if (dropZoneRef.current && !isChecked) {
        const rect = dropZoneRef.current.getBoundingClientRect()
        const isOver =
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        if (isOver) {
          handlePlaceWord(word)
        }
      }
    },
    [isChecked, handlePlaceWord]
  )

  const worldBg = worldScheme ? (
    <>
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: worldScheme.background.startsWith("/")
            ? `url(${worldScheme.background}) center/cover no-repeat`
            : worldScheme.background,
        }}
      />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-black/40" />
    </>
  ) : null

  if (phase === "intro") {
    return (
      <div className="min-h-screen flex flex-col">
        {worldBg}
        <header className="p-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm transition-colors"
            style={{ color: "rgba(255,255,255,0.70)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 pb-6 pt-0">
          <div className="w-full max-w-lg text-center space-y-4">
            {worldConfig && (
              <div className="flex justify-center -mt-8 -mb-1">
                <Image
                  src={worldConfig.characterImage}
                  alt=""
                  width={240}
                  height={240}
                  className="w-[190px] h-[190px] sm:w-[230px] sm:h-[230px] object-contain animate-fade-in-up drop-shadow-2xl"
                />
              </div>
            )}
            <div className="space-y-3">
              <span
                className="inline-block text-xs font-medium px-2.5 py-1 rounded-full border"
                style={{ color: "rgba(255,255,255,0.85)", borderColor: "rgba(255,255,255,0.30)" }}
              >
                {exercise.typeDisplayName}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "white" }}>
                {exercise.title}
              </h1>
              <p className="font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{exercise.instructions}</p>
              {exercise.instructionsAudioUrl && (
                <div className="mt-4">
                  <AudioPlayer src={exercise.instructionsAudioUrl} />
                </div>
              )}
            </div>

            <div className="flex justify-center gap-6 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
              <span className="flex items-center gap-1.5">
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
      <div className="min-h-screen flex flex-col bg-white text-gray-900">
        <header className="sticky top-0 z-10 bg-white border-b p-4">
          <div className="max-w-prose mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPhase("intro")}
              className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
            <p className="text-sm font-medium text-gray-900">
              Lee el siguiente texto con atención
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-prose mx-auto space-y-4">
            {readingAudioUrl && (
              <AudioPlayer src={readingAudioUrl} />
            )}
            <div
              className="space-y-5"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {(readingText ?? "").split(/\n+/).filter(Boolean).map((paragraph, idx) => (
                <div key={idx} className="relative">
                  <p
                    onClick={() => setActiveParagraph(idx === activeParagraph ? null : idx)}
                    onTouchStart={() => setActiveParagraph(idx === activeParagraph ? null : idx)}
                    className={cn(
                      "text-lg sm:text-xl leading-loose tracking-wide cursor-pointer px-1 py-1 transition-colors duration-200 select-none",
                      idx === activeParagraph ? "text-gray-900" : "text-gray-700"
                    )}
                  >
                    {paragraph}
                  </p>
                  {idx === activeParagraph && (
                    <div className="h-[3px] rounded-full bg-amber-400 animate-underline-slide" />
                  )}
                </div>
              ))}
            </div>
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
      <>
        {unlockedWorld && (
          <WorldUnlockNotification
            worldName={unlockedWorld.name}
            worldDisplayName={unlockedWorld.displayName}
            onDismiss={() => setUnlockedWorld(null)}
          />
        )}
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
              <div className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                <GemIcon size={48} />
                +{gemsAwarded} gemas
              </div>
            ) : (
              <p className="text-sm text-center text-muted-foreground">
                Sin gemas esta vez
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button size="lg" className="w-full text-base h-12" asChild>
              <Link href={backHref}>Volver a ejercicios</Link>
            </Button>
          </div>
        </div>
        </div>
      </>
    )
  }

  const parts = activeSentence.display_sentence.split("_______")

  return (
    <div className="min-h-screen flex flex-col">
      {worldBg}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-lg mx-auto p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Link
              href={backHref}
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
                  <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
                    <SheetHeader>
                      <SheetTitle>Texto de lectura</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4">
                      <div className="bg-white text-gray-900 rounded-2xl p-6 shadow-lg">
                        <p className="text-lg leading-loose tracking-wide font-medium whitespace-pre-wrap">
                          {readingText}
                        </p>
                      </div>
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

      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-lg mx-auto space-y-5">

          {worldConfig ? (
            <div className="flex items-start gap-3">
              <div
                key={`char-${activeSentenceIndex}`}
                className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 animate-in slide-in-from-left-6 fade-in duration-500"
              >
                <Image
                  src={worldConfig.characterImage}
                  alt="personaje"
                  fill
                  className="object-contain drop-shadow-xl"
                  sizes="(min-width: 640px) 176px, 144px"
                />
              </div>

              {(() => {
                const bubbleBg =
                  status === "correct" ? "rgba(220,252,231,0.97)" :
                  status === "incorrect" ? "rgba(254,226,226,0.97)" :
                  status === "placed" ? "rgba(219,234,254,0.97)" :
                  "rgba(255,255,255,0.95)"
                return (
                  <div
                    key={activeSentenceIndex}
                    ref={dropZoneRef}
                    className={cn(
                      "relative flex-1 rounded-2xl rounded-bl-sm border-2 p-4 sm:p-5 transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-left-4 duration-500",
                      status === "correct" && "border-green-400",
                      status === "incorrect" && "border-red-400",
                      status === "placed" && "border-blue-400",
                      status === "empty" && "border-transparent"
                    )}
                    style={{ background: bubbleBg, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
                    onDragOver={(e) => { if (isChecked) return; e.preventDefault(); e.dataTransfer.dropEffect = "move" }}
                    onDrop={handleDrop}
                    onClick={handleTapSlot}
                  >
                    <div
                      className="absolute -left-2.5 bottom-5 w-0 h-0"
                      style={{
                        borderTop: "9px solid transparent",
                        borderBottom: "9px solid transparent",
                        borderRight: `12px solid ${bubbleBg}`,
                      }}
                    />
                    <p className="text-sm sm:text-base font-semibold text-gray-900 leading-relaxed">
                      {parts[0]}
                      <span
                        className={cn(
                          "inline-flex items-center justify-center min-w-[80px] h-9 mx-1 rounded-lg border-2 border-dashed px-3 text-center font-semibold transition-all align-middle text-sm",
                          status === "empty" && "border-gray-300 text-gray-400",
                          status === "placed" && "border-blue-400 bg-blue-100 text-blue-700 cursor-pointer",
                          status === "correct" && "border-green-500 bg-green-100 text-green-700 border-solid",
                          status === "incorrect" && "border-red-500 bg-red-100 text-red-700 border-solid"
                        )}
                      >
                        {placedWord || "___"}
                        {status === "correct" && <CheckCircle2 className="h-3.5 w-3.5 ml-1 inline shrink-0" />}
                        {status === "incorrect" && <XCircle className="h-3.5 w-3.5 ml-1 inline shrink-0" />}
                      </span>
                      {parts[1]}
                    </p>
                  </div>
                )
              })()}
            </div>
          ) : (
            <div
              ref={dropZoneRef}
              className={cn(
                "rounded-xl border-2 p-6 transition-all duration-300",
                status === "correct" && "border-green-500 bg-green-50 dark:bg-green-950/30",
                status === "incorrect" && "border-red-500 bg-red-50 dark:bg-red-950/30",
                status === "placed" && "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
                status === "empty" && "border-border"
              )}
              onDragOver={(e) => { if (isChecked) return; e.preventDefault(); e.dataTransfer.dropEffect = "move" }}
              onDrop={handleDrop}
              onClick={handleTapSlot}
            >
              <p className="text-lg sm:text-xl leading-relaxed inline">
                {parts[0]}
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[100px] h-10 mx-1 rounded-lg border-2 border-dashed px-4 text-center font-semibold transition-all align-middle",
                    status === "empty" && "border-muted-foreground/30 text-muted-foreground/50",
                    status === "placed" && "border-blue-400 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 cursor-pointer",
                    status === "correct" && "border-green-500 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-solid",
                    status === "incorrect" && "border-red-500 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-solid"
                  )}
                >
                  {placedWord || "___"}
                  {status === "correct" && <CheckCircle2 className="h-4 w-4 ml-1.5 inline" />}
                  {status === "incorrect" && <XCircle className="h-4 w-4 ml-1.5 inline" />}
                </span>
                {parts[1]}
              </p>
            </div>
          )}

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
                    onTouchStart={(e) => handleTouchStartDrag(e, word)}
                    onTouchMove={handleTouchMoveDrag}
                    onTouchEnd={(e) => handleTouchEndDrag(e, word)}
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
