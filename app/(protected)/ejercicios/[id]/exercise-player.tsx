"use client";

import { useState, useCallback, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/ui/audio-player";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  BarChart3,
  CheckCircle2,
  XCircle,
  Trophy,
  ChevronRight,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { GemIcon } from "@/components/gem-icon";
import { checkAnswer, completeExercise, completeTimedReading } from "./actions";
import type { AnswerResult } from "./actions";
import { LetterGapPlayer } from "./letter-gap-player";
import { getScheme } from "@/app/(protected)/ejercicios/(browse)/mundos/world-color-schemes";
import { getWorldConfig } from "@/lib/worlds";

type Option = {
  id: string;
  text: string;
  image_url?: string | null;
};

type Question = {
  id: string;
  text: string;
  description?: string | null;
  question_image_url?: string | null;
  question_audio_url?: string | null;
  options: Option[];
  points: number;
};

type CheckResult = {
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string | null;
};

type ExerciseProps = {
  exercise: {
    id: string;
    title: string;
    instructions: string;
    instructionsAudioUrl: string | null;
    difficultyLevel: number;
    content: Record<string, unknown>;
    typeName: string;
    typeDisplayName: string;
    worldId?: string | null;
  };
  worldId?: string;
  worldName?: string;
  backHref: string;
};

type Phase = "intro" | "reading" | "questions" | "review-intro" | "review" | "results";

const difficultyLabels: Record<number, string> = {
  1: "Muy fácil",
  2: "Fácil",
  3: "Intermedio",
  4: "Difícil",
  5: "Muy difícil",
};

const textDifficultyLabels: Record<string, string> = {
  simple: "Texto: Simple",
  moderado: "Texto: Moderado",
  complejo: "Texto: Complejo",
};

function getQuestions(content: Record<string, unknown>): Question[] {
  return (content.questions as Question[]) || [];
}

function getReadingText(content: Record<string, unknown>): string {
  return (content.reading_text as string) || "";
}

function getReadingAudioUrl(content: Record<string, unknown>): string | null {
  return (content.reading_audio_url as string) || null;
}

function getResultMessage(percentage: number): string {
  if (percentage === 100) return "¡Perfecto! Excelente trabajo";
  if (percentage >= 80) return "¡Muy bien! Casi perfecto";
  if (percentage >= 60) return "¡Buen trabajo! Sigue practicando";
  if (percentage >= 40) return "Vas por buen camino, no te rindas";
  return "¡Ánimo! La práctica hace al maestro";
}

function getResultEmoji(percentage: number): string {
  if (percentage === 100) return "🏆";
  if (percentage >= 80) return "🌟";
  if (percentage >= 60) return "💪";
  if (percentage >= 40) return "📚";
  return "🎯";
}

function getWordCount(content: Record<string, unknown>): number {
  return (content.word_count as number) || 0;
}

function getWpmMessage(wpm: number): string {
  if (wpm >= 200) return "¡Velocidad impresionante!";
  if (wpm >= 150) return "¡Muy buena velocidad!";
  if (wpm >= 100) return "¡Buen ritmo de lectura!";
  if (wpm >= 60) return "¡Vas muy bien! Sigue practicando";
  return "¡Excelente concentración! La velocidad mejora con la práctica";
}

function getWpmEmoji(wpm: number): string {
  if (wpm >= 200) return "🚀";
  if (wpm >= 150) return "🌟";
  if (wpm >= 100) return "💪";
  if (wpm >= 60) return "📖";
  return "🐢";
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ExercisePlayer({ exercise, worldId, worldName, backHref }: ExerciseProps) {
  if (exercise.typeName === "letter_gap") {
    return <LetterGapPlayer exercise={exercise} worldId={worldId} worldName={worldName} backHref={backHref} />;
  }
  return <BaseExercisePlayer exercise={exercise} worldId={worldId} worldName={worldName} backHref={backHref} />;
}

function BaseExercisePlayer({ exercise, worldId, worldName, backHref }: ExerciseProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [gemsAwarded, setGemsAwarded] = useState<number | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [finalTimeSeconds, setFinalTimeSeconds] = useState(0);
  const [wordsPerMinute, setWordsPerMinute] = useState(0);
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);

  const [reviewQueue, setReviewQueue] = useState<Question[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isFirstReviewRound, setIsFirstReviewRound] = useState(true);
  const [reviewReadingActive, setReviewReadingActive] = useState(false);
  const reviewFailedRef = useRef<string[]>([]);

  const answersRef = useRef<AnswerResult[]>([]);
  const startedAtRef = useRef(0);

  const questions = getQuestions(exercise.content);
  const isReadingComprehension = exercise.typeName === "reading_comprehension";
  const isTimedReading = exercise.typeName === "timed_reading";
  const readingText =
    isReadingComprehension || isTimedReading ? getReadingText(exercise.content) : "";
  const readingAudioUrl =
    isReadingComprehension || isTimedReading ? getReadingAudioUrl(exercise.content) : null;
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const wordCount = isTimedReading ? getWordCount(exercise.content) : 0;
  const showTimer = isTimedReading
    ? (exercise.content.show_timer as boolean) !== false
    : false;
  const hideTextDuringQuestions = isReadingComprehension
    ? (exercise.content.hide_text_during_questions as boolean) === true
    : true;

  const worldScheme = worldName ? getScheme(worldName) : null;
  const worldConfig = worldName ? getWorldConfig(worldName) : null;

  const currentQuestion = questions[currentIndex];
  const isChecked = checkResult !== null;
  const isCorrect = checkResult?.isCorrect ?? false;
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress =
    questions.length > 0 ? ((currentIndex + (isChecked ? 1 : 0)) / questions.length) * 100 : 0;

  const currentReviewQuestion = reviewQueue[reviewIndex] ?? null;
  const reviewProgress =
    reviewQueue.length > 0 ? ((reviewIndex + (isChecked ? 1 : 0)) / reviewQueue.length) * 100 : 0;
  const isLastReviewQuestion = reviewIndex === reviewQueue.length - 1;

  const handleStart = useCallback(() => {
    startedAtRef.current = Date.now();
    if (isReadingComprehension || isTimedReading) {
      setPhase("reading");
    } else {
      setPhase("questions");
    }
  }, [isReadingComprehension, isTimedReading]);

  useEffect(() => {
    if (phase !== "reading" || !isTimedReading) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, isTimedReading]);

  useEffect(() => {
    const container = audioContainerRef.current;
    if (!container) return;
    const audios = container.querySelectorAll("audio");
    audios.forEach((audio) => {
      if (!audio.paused) audio.pause();
    });
  }, [currentIndex, reviewIndex]);

  const finishExercise = useCallback(() => {
    setCorrectCount(questions.length);
    setPhase("results");
    setIsCompleting(true);
    const durationSeconds = Math.round((Date.now() - startedAtRef.current) / 1000);
    completeExercise({
      exerciseId: exercise.id,
      answers: answersRef.current,
      totalQuestions: questions.length,
      correctAnswers: questions.length,
      durationSeconds,
    })
      .then((result) => {
        setGemsAwarded(result.gemsAwarded);
      })
      .catch(() => setGemsAwarded(0))
      .finally(() => setIsCompleting(false));
  }, [exercise.id, questions.length]);

  const handleFinishReading = useCallback(() => {
    const elapsed = Math.round((Date.now() - startedAtRef.current) / 1000);
    const timeForCalc = Math.max(elapsed, 1);
    const wpm = Math.round((wordCount / timeForCalc) * 60);
    setFinalTimeSeconds(elapsed);
    setWordsPerMinute(wpm);
    setPhase("results");
    setIsCompleting(true);
    completeTimedReading({
      exerciseId: exercise.id,
      timeSeconds: elapsed,
      wordCount,
      wordsPerMinute: wpm,
    })
      .then((result) => {
        setGemsAwarded(result.gemsAwarded);
      })
      .catch(() => setGemsAwarded(0))
      .finally(() => setIsCompleting(false));
  }, [exercise.id, wordCount]);

  const handleCheck = useCallback(() => {
    if (!selectedOptionId || !currentQuestion) return;
    startTransition(async () => {
      const result = await checkAnswer(exercise.id, currentQuestion.id, selectedOptionId);
      setCheckResult(result);
      answersRef.current.push({
        questionId: currentQuestion.id,
        selectedOptionId,
        correctOptionId: result.correctOptionId,
        isCorrect: result.isCorrect,
      });
      const pts = currentQuestion.points || 1;
      setTotalPoints((p) => p + pts);
      if (result.isCorrect) {
        setCorrectCount((c) => c + 1);
        setEarnedPoints((p) => p + pts);
      }
    });
  }, [selectedOptionId, currentQuestion, exercise.id]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      const incorrect = answersRef.current.filter((a) => !a.isCorrect);
      if (incorrect.length > 0) {
        const incorrectIds = new Set(incorrect.map((a) => a.questionId));
        const queue = questions.filter((q) => incorrectIds.has(q.id));
        reviewFailedRef.current = [];
        setReviewQueue(queue);
        setReviewIndex(0);
        setIsFirstReviewRound(true);
        setSelectedOptionId(null);
        setCheckResult(null);
        setPhase("review-intro");
      } else {
        finishExercise();
      }
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOptionId(null);
      setCheckResult(null);
    }
  }, [isLastQuestion, questions, finishExercise]);

  const handleReviewCheck = useCallback(() => {
    if (!selectedOptionId || !currentReviewQuestion) return;
    startTransition(async () => {
      const result = await checkAnswer(exercise.id, currentReviewQuestion.id, selectedOptionId);
      setCheckResult(result);
      if (result.isCorrect) {
        const idx = answersRef.current.findIndex((a) => a.questionId === currentReviewQuestion.id);
        if (idx >= 0) {
          answersRef.current[idx] = {
            ...answersRef.current[idx],
            selectedOptionId,
            isCorrect: true,
          };
        }
      } else {
        reviewFailedRef.current.push(currentReviewQuestion.id);
      }
    });
  }, [selectedOptionId, currentReviewQuestion, exercise.id]);

  const handleReviewNext = useCallback(() => {
    if (isLastReviewQuestion) {
      if (reviewFailedRef.current.length > 0) {
        const failedIds = new Set(reviewFailedRef.current);
        const newQueue = reviewQueue.filter((q) => failedIds.has(q.id));
        reviewFailedRef.current = [];
        setIsFirstReviewRound(false);
        setReviewQueue(newQueue);
        setReviewIndex(0);
        setSelectedOptionId(null);
        setCheckResult(null);
        setPhase("review");
      } else {
        finishExercise();
      }
    } else {
      setReviewIndex((i) => i + 1);
      setSelectedOptionId(null);
      setCheckResult(null);
    }
  }, [isLastReviewQuestion, reviewQueue, finishExercise]);

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
  ) : null;

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
              <p className="font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>
                {exercise.instructions}
              </p>
              {exercise.instructionsAudioUrl && (
                <div className="mt-4">
                  <AudioPlayer src={exercise.instructionsAudioUrl} />
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" />
                {difficultyLabels[exercise.difficultyLevel]}
              </span>
              {isReadingComprehension && !!exercise.content.text_difficulty && (
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {textDifficultyLabels[exercise.content.text_difficulty as string] ?? String(exercise.content.text_difficulty)}
                </span>
              )}
              {isTimedReading ? (
                <span className="flex items-center gap-1.5">
                  {wordCount} palabra{wordCount !== 1 && "s"}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  {questions.length} pregunta{questions.length !== 1 && "s"}
                </span>
              )}
            </div>
            <Button size="lg" className="w-full max-w-xs text-base h-12" onClick={handleStart}>
              Comenzar
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (phase === "review-intro") {
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
          <div className="w-full max-w-lg text-center space-y-6">
            {worldConfig ? (
              <>
                <div className="flex justify-center -mt-4 -mb-1">
                  <Image
                    src={worldConfig.characterImage}
                    alt=""
                    width={200}
                    height={200}
                    className="w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] object-contain animate-fade-in-up drop-shadow-2xl"
                  />
                </div>
                <div
                  className="rounded-2xl px-6 py-5 text-center mx-auto max-w-sm"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.20)",
                  }}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <RotateCcw className="h-5 w-5 text-amber-300" />
                    <span className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                      Repaso
                    </span>
                  </div>
                  <p className="text-lg font-bold text-white leading-snug">
                    ¡Vamos a corregir las respuestas incorrectas!
                  </p>
                  <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.70)" }}>
                    {reviewQueue.length} pregunta{reviewQueue.length !== 1 && "s"} para repasar
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 px-6 py-8 text-center space-y-3">
                <RotateCcw className="h-10 w-10 text-amber-500 mx-auto" />
                <h2 className="text-xl font-bold text-gray-900">
                  ¡Vamos a corregir las respuestas incorrectas!
                </h2>
                <p className="text-sm text-muted-foreground">
                  {reviewQueue.length} pregunta{reviewQueue.length !== 1 && "s"} para repasar
                </p>
              </div>
            )}
            <Button
              size="lg"
              className="w-full max-w-xs text-base h-12"
              onClick={() => {
                if (isFirstReviewRound && (isReadingComprehension || isTimedReading) && readingText) {
                  setReviewReadingActive(true);
                  setPhase("reading");
                } else {
                  setPhase("review");
                }
              }}
            >
              Continuar
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (phase === "reading") {
    return (
      <div className="min-h-screen flex flex-col bg-white text-gray-900">
        <header className="sticky top-0 z-10 bg-white border-b p-4">
          <div className="max-w-prose mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPhase(reviewReadingActive ? "review-intro" : "intro")}
              className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
            {isTimedReading ? (
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-gray-700">Lee a tu ritmo</p>
                {showTimer && (
                  <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5">
                    <Clock className="h-4 w-4 text-gray-700" />
                    <span className="text-lg font-mono font-semibold tabular-nums text-gray-900">
                      {formatTimer(timerSeconds)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-900">
                {reviewReadingActive ? "Repasá el texto" : "Lee el siguiente texto con atención"}
              </p>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-prose mx-auto space-y-4">
            {readingAudioUrl && <AudioPlayer src={readingAudioUrl} />}
            <div className="space-y-5" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              {readingText.split(/\n+/).filter(Boolean).map((paragraph, idx) => (
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
          <div className="max-w-prose mx-auto">
            {isTimedReading ? (
              <Button
                size="lg"
                className="w-full text-base h-14"
                onClick={handleFinishReading}
                style={worldConfig ? { backgroundColor: worldConfig.accentColor, color: "#fff" } : undefined}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Terminé de leer
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full text-base h-12"
                onClick={() => {
                  if (reviewReadingActive) {
                    setReviewReadingActive(false);
                    setPhase("review");
                  } else {
                    setPhase("questions");
                  }
                }}
                style={worldConfig ? { backgroundColor: worldConfig.accentColor, color: "#fff" } : undefined}
              >
                {reviewReadingActive ? "Continuar al repaso" : "Continuar a las preguntas"}
                <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            )}
          </div>
        </footer>
      </div>
    );
  }

  if (phase === "results") {
    if (isTimedReading) {
      return (
        <>
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-lg text-center space-y-8">
              <div className="text-6xl">{getWpmEmoji(wordsPerMinute)}</div>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold">{getWpmMessage(wordsPerMinute)}</h1>
                <p className="text-muted-foreground">{exercise.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-muted p-4 space-y-1">
                  <p className="text-3xl font-bold">{formatTimer(finalTimeSeconds)}</p>
                  <p className="text-xs text-muted-foreground">Tiempo de lectura</p>
                </div>
                <div className="rounded-2xl bg-muted p-4 space-y-1">
                  <p className="text-3xl font-bold">{wordsPerMinute}</p>
                  <p className="text-xs text-muted-foreground">Palabras por minuto</p>
                </div>
              </div>
              <div className="rounded-2xl bg-muted p-4 space-y-1">
                <p className="text-2xl font-bold">{wordCount}</p>
                <p className="text-xs text-muted-foreground">Palabras leídas</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border border-yellow-200 dark:border-yellow-800 p-4">
                {isCompleting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                    <p className="text-sm text-muted-foreground">Calculando gemas...</p>
                  </div>
                ) : gemsAwarded && gemsAwarded > 0 ? (
                  <div className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                    <GemIcon size={48} />
                    +{gemsAwarded} gemas
                  </div>
                ) : (
                  <p className="text-sm text-center text-muted-foreground">Sin gemas esta vez</p>
                )}
              </div>
              <Button size="lg" className="w-full text-base h-12" asChild>
                <Link href={backHref}>Volver a ejercicios</Link>
              </Button>
            </div>
          </div>
        </>
      );
    }

    const percentage =
      questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-lg text-center space-y-8">
            <div className="text-6xl">{getResultEmoji(percentage)}</div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{getResultMessage(percentage)}</h1>
              <p className="text-muted-foreground">{exercise.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-muted p-4 space-y-1">
                <p className="text-3xl font-bold">{percentage}%</p>
                <p className="text-xs text-muted-foreground">Aciertos</p>
              </div>
              <div className="rounded-2xl bg-muted p-4 space-y-1">
                <p className="text-3xl font-bold">{correctCount}/{questions.length}</p>
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
                  <p className="text-sm text-muted-foreground">Calculando gemas...</p>
                </div>
              ) : gemsAwarded && gemsAwarded > 0 ? (
                <div className="text-2xl font-bold text-center flex items-center justify-center gap-1">
                  <GemIcon size={20} className="mr-1" />
                  +{gemsAwarded} gemas
                </div>
              ) : (
                <p className="text-sm text-center text-muted-foreground">Sin gemas esta vez</p>
              )}
            </div>
            <Button size="lg" className="w-full text-base h-12" asChild>
              <Link href={backHref}>Volver a ejercicios</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  const isReview = phase === "review";
  const activeQuestion = isReview ? currentReviewQuestion : currentQuestion;
  const activeProgress = isReview ? reviewProgress : progress;
  const activeIndex = isReview ? reviewIndex : currentIndex;
  const activeTotal = isReview ? reviewQueue.length : questions.length;
  const isLastActive = isReview ? isLastReviewQuestion : isLastQuestion;

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
              {isReadingComprehension && !hideTextDuringQuestions && !isReview && (
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
                {activeIndex + 1} / {activeTotal}
              </span>
            </div>
          </div>

          {isReview && (
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
              <RotateCcw className="h-4 w-4" />
              Corrige tus respuestas incorrectas
            </div>
          )}

          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={activeProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                isReview ? "bg-amber-500" : "bg-primary"
              )}
              style={{ width: `${activeProgress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6">
        <div ref={audioContainerRef} className="max-w-lg mx-auto space-y-5">
          {worldConfig ? (
            <div className="flex items-start gap-3">
              <div
                key={`char-${activeIndex}`}
                className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 animate-in slide-in-from-left-6 fade-in duration-500"
              >
                <Image
                  src={worldConfig.characterImage}
                  alt="personaje"
                  fill
                  className="object-contain drop-shadow-xl"
                  sizes="(min-width: 640px) 96px, 80px"
                />
              </div>
              <div
                key={activeIndex}
                className="relative flex-1 rounded-2xl rounded-bl-sm p-4 sm:p-5 animate-in fade-in slide-in-from-left-4 duration-500"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
                }}
              >
                <div
                  className="absolute -left-2 bottom-4 w-0 h-0"
                  style={{
                    borderTop: "8px solid transparent",
                    borderBottom: "8px solid transparent",
                    borderRight: "10px solid rgba(255,255,255,0.95)",
                  }}
                />
                <p className="text-sm sm:text-base font-semibold text-gray-900 leading-snug">
                  {activeQuestion?.text}
                </p>
                {activeQuestion?.description && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
                    {activeQuestion.description}
                  </p>
                )}
                {activeQuestion?.question_audio_url && (
                  <div className="mt-3">
                    <AudioPlayer src={activeQuestion.question_audio_url} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg sm:text-xl font-semibold">{activeQuestion?.text}</h2>
              {activeQuestion?.description && (
                <p className="text-muted-foreground">{activeQuestion.description}</p>
              )}
              {activeQuestion?.question_audio_url && (
                <AudioPlayer src={activeQuestion.question_audio_url} />
              )}
            </>
          )}

          {activeQuestion?.question_image_url && (
            <Image
              src={activeQuestion.question_image_url}
              alt="Imagen de la pregunta"
              width={400}
              height={200}
              className="w-full max-h-[120px] rounded-lg object-contain"
            />
          )}

          <div className="space-y-3" role="radiogroup" aria-label="Opciones de respuesta">
            {activeQuestion?.options.map((option, index) => {
              const isSelected = selectedOptionId === option.id;
              const isCorrectOption = isChecked && option.id === checkResult?.correctOptionId;

              let variant = "default";
              if (isChecked) {
                if (isCorrectOption) variant = "correct";
                else if (isSelected && !isCorrectOption) variant = "incorrect";
                else variant = "dimmed";
              } else if (isSelected) {
                variant = "selected";
              }

              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={isChecked || isPending}
                  onClick={() => setSelectedOptionId(option.id)}
                  style={{ animationDelay: `${index * 80}ms` }}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 min-h-[48px] text-sm sm:text-base bg-white text-gray-900",
                    "animate-in slide-in-from-right-4 fade-in duration-300 fill-mode-backwards",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    variant === "default" &&
                      "border-gray-200 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98]",
                    variant === "selected" && "border-blue-500 bg-blue-50",
                    variant === "correct" && "border-green-500 bg-green-50",
                    variant === "incorrect" && "border-red-500 bg-red-50",
                    variant === "dimmed" && "border-gray-200 opacity-50",
                    (isChecked || isPending) && "cursor-default"
                  )}
                >
                  <div className={cn("flex items-center gap-3", option.image_url && "flex-row")}>
                    <span
                      className={cn(
                        "flex shrink-0 items-center justify-center h-6 w-6 rounded-full border-2 text-xs font-bold transition-colors",
                        variant === "default" && "border-gray-300",
                        variant === "selected" && "border-blue-500 bg-blue-500 text-white",
                        variant === "correct" && "border-green-500 bg-green-500 text-white",
                        variant === "incorrect" && "border-red-500 bg-red-500 text-white",
                        variant === "dimmed" && "border-muted-foreground/20"
                      )}
                    >
                      {isChecked && isCorrectOption && <CheckCircle2 className="h-4 w-4" />}
                      {isChecked && isSelected && !isCorrectOption && <XCircle className="h-4 w-4" />}
                    </span>
                    {option.image_url && (
                      <Image
                        src={option.image_url}
                        alt={option.text}
                        width={200}
                        height={80}
                        className="max-h-[80px] w-auto rounded-md object-contain"
                      />
                    )}
                    <span className="flex-1">{option.text}</span>
                  </div>
                </button>
              );
            })}
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
              <p className="font-semibold mb-1">{isCorrect ? "¡Correcto!" : "Incorrecto"}</p>
              {!isCorrect && checkResult?.explanation && (
                <p className="text-xs opacity-80">{checkResult.explanation}</p>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4">
        <div className="max-w-lg mx-auto">
          {!isChecked ? (
            <Button
              size="lg"
              className="w-full text-base h-12"
              disabled={!selectedOptionId || isPending}
              onClick={isReview ? handleReviewCheck : handleCheck}
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
          ) : (
            <Button
              size="lg"
              className="w-full text-base h-12"
              onClick={isReview ? handleReviewNext : handleNext}
            >
              {isReview
                ? isLastActive && reviewFailedRef.current.length === 0
                  ? "Ver resultados"
                  : "Siguiente"
                : isLastActive
                  ? answersRef.current.filter((a) => !a.isCorrect).length > 0
                    ? "Corregir respuestas"
                    : "Ver resultados"
                  : "Siguiente"}
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
