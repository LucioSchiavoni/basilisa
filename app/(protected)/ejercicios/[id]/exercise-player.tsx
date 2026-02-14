"use client";

import { useState, useCallback, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/ui/audio-player";
import { Badge } from "@/components/ui/badge";
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
  Gem,
} from "lucide-react";
import { checkAnswer, completeExercise, completeTimedReading } from "./actions";
import type { AnswerResult } from "./actions";
import { LetterGapPlayer } from "./letter-gap-player";

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
  };
};

type Phase = "intro" | "reading" | "questions" | "results";

const difficultyLabels: Record<number, string> = {
  1: "Muy fácil",
  2: "Fácil",
  3: "Intermedio",
  4: "Difícil",
  5: "Muy difícil",
};

const difficultyColors: Record<number, string> = {
  1: "text-green-600",
  2: "text-green-600",
  3: "text-yellow-600",
  4: "text-red-600",
  5: "text-red-600",
};

function getQuestions(content: Record<string, unknown>): Question[] {
  const questions = (content.questions as Question[]) || [];
  return questions;
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

export function ExercisePlayer({ exercise }: ExerciseProps) {
  if (exercise.typeName === "letter_gap") {
    return <LetterGapPlayer exercise={exercise} />;
  }

  return <BaseExercisePlayer exercise={exercise} />;
}

function BaseExercisePlayer({ exercise }: ExerciseProps) {
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
  const answersRef = useRef<AnswerResult[]>([]);
  const startedAtRef = useRef(0);

  const questions = getQuestions(exercise.content);
  const isReadingComprehension = exercise.typeName === "reading_comprehension";
  const isTimedReading = exercise.typeName === "timed_reading";
  const readingText =
    isReadingComprehension || isTimedReading
      ? getReadingText(exercise.content)
      : "";
  const readingAudioUrl =
    isReadingComprehension || isTimedReading
      ? getReadingAudioUrl(exercise.content)
      : null;
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const wordCount = isTimedReading ? getWordCount(exercise.content) : 0;
  const showTimer = isTimedReading
    ? (exercise.content.show_timer as boolean) !== false
    : false;
  const hideTextDuringQuestions = isReadingComprehension
    ? (exercise.content.hide_text_during_questions as boolean) === true
    : true;

  const currentQuestion = questions[currentIndex];
  const isChecked = checkResult !== null;
  const isCorrect = checkResult?.isCorrect ?? false;
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress =
    questions.length > 0 ? ((currentIndex + (isChecked ? 1 : 0)) / questions.length) * 100 : 0;

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
  }, [currentIndex]);

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
      .then((result) => setGemsAwarded(result.gemsAwarded))
      .catch(() => setGemsAwarded(0))
      .finally(() => setIsCompleting(false));
  }, [exercise.id, wordCount]);

  const handleCheck = useCallback(() => {
    if (!selectedOptionId || !currentQuestion) return;

    startTransition(async () => {
      const result = await checkAnswer(
        exercise.id,
        currentQuestion.id,
        selectedOptionId
      );
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
  }, [selectedOptionId, currentQuestion, exercise.id, currentIndex]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      setPhase("results");
      setIsCompleting(true);
      const durationSeconds = Math.round(
        (Date.now() - startedAtRef.current) / 1000
      );
      const currentAnswers = answersRef.current;
      completeExercise({
        exerciseId: exercise.id,
        answers: currentAnswers,
        totalQuestions: questions.length,
        correctAnswers: currentAnswers.filter((a) => a.isCorrect).length,
        durationSeconds,
      })
        .then((result) => setGemsAwarded(result.gemsAwarded))
        .catch(() => setGemsAwarded(0))
        .finally(() => setIsCompleting(false));
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOptionId(null);
      setCheckResult(null);
    }
  }, [isLastQuestion, exercise.id, questions.length]);

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

  if (phase === "reading") {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b p-4">
          <div className="max-w-lg mx-auto">
            {isTimedReading ? (
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Lee a tu ritmo
                </p>
                {showTimer && (
                  <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-lg font-mono font-semibold tabular-nums">
                      {formatTimer(timerSeconds)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm font-medium text-center text-muted-foreground">
                Lee el siguiente texto con atención
              </p>
            )}
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
            {isTimedReading ? (
              <Button
                size="lg"
                className="w-full text-base h-14"
                onClick={handleFinishReading}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Terminé de leer
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full text-base h-12"
                onClick={() => setPhase("questions")}
              >
                Continuar a las preguntas
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
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-lg text-center space-y-8">
            <div className="text-6xl">{getWpmEmoji(wordsPerMinute)}</div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold">
                {getWpmMessage(wordsPerMinute)}
              </h1>
              <p className="text-muted-foreground">{exercise.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-muted p-4 space-y-1">
                <p className="text-3xl font-bold">
                  {formatTimer(finalTimeSeconds)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Tiempo de lectura
                </p>
              </div>
              <div className="rounded-2xl bg-muted p-4 space-y-1">
                <p className="text-3xl font-bold">{wordsPerMinute}</p>
                <p className="text-xs text-muted-foreground">
                  Palabras por minuto
                </p>
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
      );
    }

    const percentage =
      questions.length > 0
        ? Math.round((correctCount / questions.length) * 100)
        : 0;

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
                {correctCount}/{questions.length}
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
    );
  }

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
              {isReadingComprehension && !hideTextDuringQuestions && (
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
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div ref={audioContainerRef} className="max-w-lg mx-auto space-y-6">
          {currentQuestion?.question_image_url && (
            <Image
              src={currentQuestion.question_image_url}
              alt="Imagen de la pregunta"
              width={500}
              height={300}
              className="w-full max-h-[200px] rounded-lg border object-contain"
            />
          )}

          <h2 className="text-lg sm:text-xl font-semibold">
            {currentQuestion?.text}
          </h2>

          {currentQuestion?.description && (
            <p className="text-muted-foreground">{currentQuestion.description}</p>
          )}

          {currentQuestion?.question_audio_url && (
            <AudioPlayer src={currentQuestion.question_audio_url} />
          )}

          <div className="space-y-3" role="radiogroup" aria-label="Opciones de respuesta">
            {currentQuestion?.options.map((option, index) => {
              const isSelected = selectedOptionId === option.id;
              const isCorrectOption =
                isChecked && option.id === checkResult?.correctOptionId;

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
                    "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 min-h-[48px] text-sm sm:text-base",
                    "animate-in slide-in-from-right-4 fade-in duration-300 fill-mode-backwards",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    variant === "default" &&
                      "border-border hover:border-foreground/30 hover:bg-accent active:scale-[0.98]",
                    variant === "selected" &&
                      "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
                    variant === "correct" &&
                      "border-green-500 bg-green-50 dark:bg-green-950/30",
                    variant === "incorrect" &&
                      "border-red-500 bg-red-50 dark:bg-red-950/30",
                    variant === "dimmed" &&
                      "border-border opacity-50",
                    (isChecked || isPending) && "cursor-default"
                  )}
                >
                  <div className={cn("flex items-center gap-3", option.image_url && "flex-row")}>
                    <span
                      className={cn(
                        "flex shrink-0 items-center justify-center h-6 w-6 rounded-full border-2 text-xs font-bold transition-colors",
                        variant === "default" && "border-muted-foreground/40",
                        variant === "selected" &&
                          "border-blue-500 bg-blue-500 text-white",
                        variant === "correct" &&
                          "border-green-500 bg-green-500 text-white",
                        variant === "incorrect" &&
                          "border-red-500 bg-red-500 text-white",
                        variant === "dimmed" && "border-muted-foreground/20"
                      )}
                    >
                      {isChecked && isCorrectOption && (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      {isChecked && isSelected && !isCorrectOption && (
                        <XCircle className="h-4 w-4" />
                      )}
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
              <p className="font-semibold mb-1">
                {isCorrect ? "¡Correcto!" : "Incorrecto"}
              </p>
              {!isCorrect && checkResult?.explanation && (
                <p className="text-xs opacity-80">
                  {checkResult.explanation}
                </p>
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
          ) : (
            <Button
              size="lg"
              className="w-full text-base h-12"
              onClick={handleNext}
            >
              {isLastQuestion ? "Ver resultados" : "Siguiente"}
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
