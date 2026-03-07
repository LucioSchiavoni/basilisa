"use client";

import { useEffect } from "react";
import { fireWinConfetti } from "@/lib/confetti";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock } from "lucide-react";
import { ScorePie } from "./score-pie";
import { GemCounter } from "./gem-counter";
import type { AnswerResult } from "./actions";
import type { Question } from "./exercise-player";
import { AnswersChart, type AnswersChartItem } from "./answers-chart";

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


type Props = {
  isTimedReading: boolean;
  exerciseTitle: string;
  backHref: string;
  isCompleting: boolean;
  gemsAwarded: number | null;
  initialGems: number;
  finalTimeSeconds: number;
  wordsPerMinute: number;
  wordCount: number;
  correctCount: number;
  totalQuestions: number;
  earnedPoints: number;
  totalPoints: number;
  totalTimeSeconds: number;
  readingTimeSeconds?: number;
  maxReadingTime?: number;
  answers?: AnswerResult[];
  questions?: Question[];
};

function QuestionsReport({ questions, answers, maxSeconds }: { questions: Question[]; answers: AnswerResult[]; maxSeconds?: number }) {
  if (!questions.length || !answers.length) return null;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const totalCount = questions.length;
  const chartItems: AnswersChartItem[] = questions.flatMap((q) => {
    const answer = answers.find((a) => a.questionId === q.id);
    if (!answer) return [];
    const selectedOption = q.options.find((o) => o.id === answer.selectedOptionId);
    const correctOption = q.options.find((o) => o.id === answer.correctOptionId);
    return [{
      questionText: q.text,
      selectedAnswer: selectedOption?.text ?? "—",
      correctAnswer: correctOption?.text ?? "—",
      isCorrect: answer.isCorrect,
      timedOut: answer.timedOut,
      timeSpentSeconds: answer.timeSpentSeconds,
    }];
  });
  return (
    <div className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Detalle por pregunta
        </p>
        <span className="text-sm font-semibold tabular-nums">{correctCount}/{totalCount}</span>
      </div>
      <AnswersChart answers={chartItems} maxSeconds={maxSeconds} />
    </div>
  );
}

export function PhaseResults({
  isTimedReading,
  exerciseTitle,
  backHref,
  isCompleting,
  gemsAwarded,
  initialGems,
  finalTimeSeconds,
  wordsPerMinute,
  wordCount,
  correctCount,
  totalQuestions,
  earnedPoints,
  totalPoints,
  totalTimeSeconds,
  readingTimeSeconds,
  maxReadingTime,
  answers = [],
  questions = [],
}: Props) {
  useEffect(() => {
    if (isTimedReading) return;
    const pct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    if (pct !== 100) return;
    let cleanup: (() => void) | undefined;
    const t0 = setTimeout(() => { cleanup = fireWinConfetti() }, 50);
    return () => { clearTimeout(t0); cleanup?.() };
  }, [isTimedReading, correctCount, totalQuestions]);

  if (isTimedReading) {
    return (
      <>
        <GemCounter initialGems={initialGems} gemsAwarded={gemsAwarded} isCompleting={isCompleting} />
        <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
          <div className="w-full max-w-lg text-center space-y-8">
            <div className="text-6xl">{getWpmEmoji(wordsPerMinute)}</div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight ">{getWpmMessage(wordsPerMinute)}</h1>
              <p className="text-muted-foreground">{exerciseTitle}</p>
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
            <Button size="lg" className="w-full text-base h-12" asChild>
              <Link href={backHref}>Volver a ejercicios</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <>
      <GemCounter initialGems={initialGems} gemsAwarded={gemsAwarded} isCompleting={isCompleting} />
      <div className="min-h-screen pt-10 pb-28 px-6 bg-background text-foreground">
        <div className="w-full max-w-lg mx-auto space-y-6">
          <div className="text-center space-y-6">
            <div className="text-6xl">{getResultEmoji(percentage)}</div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-foreground">{getResultMessage(percentage)}</h1>
              <p className="text-muted-foreground">{exerciseTitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted py-6 px-4 flex items-center justify-center">
                <ScorePie percentage={percentage} />
              </div>
              <div className="rounded-2xl bg-muted p-5 flex flex-col justify-center gap-2">
                {readingTimeSeconds !== undefined ? (
                  <>
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-2xl font-bold tabular-nums">{formatTimer(readingTimeSeconds)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Tiempo de lectura</p>
                    </div>
                    <div className="border-t border-border/60 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Total
                        </span>
                        <span className="tabular-nums font-semibold">{formatTimer(totalTimeSeconds)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold tabular-nums">{formatTimer(totalTimeSeconds)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Tiempo total</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <QuestionsReport questions={questions} answers={answers} maxSeconds={maxReadingTime} />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm border-t p-4">
        <div className="max-w-lg mx-auto">
          <Button size="lg" className="w-full text-base h-12" asChild>
            <Link href={backHref}>Volver a ejercicios</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
