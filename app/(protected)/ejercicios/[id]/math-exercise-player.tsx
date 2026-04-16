"use client";

import { useReducer, useCallback, useTransition, useRef, useState } from "react";
import { completeExercise, getPreviousAttempts } from "./actions";
import type { AnswerResult } from "./actions";
import { PhaseIntro } from "./phase-intro";
import { PhaseResults } from "./phase-results";
import { motion } from "framer-motion";
import type { ExerciseProps } from "./exercise-player";
import Image from "next/image";
import Link from "next/link";
import { XCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWorldConfig } from "@/lib/worlds";

type MathQuestion = {
  id: string;
  stimulus_text: string | null;
  stimulus_image_url: string | null;
  answer_type: "number_gap_input" | "number_gap_options" | "multiple_choice";
  expression: string | null;
  options: string[] | null;
  points: number;
};

type InstructionBlock = {
  id: string;
  type: "text" | "image";
  content: string;
};

type Phase = "intro" | "questions" | "results";

type State = {
  phase: Phase;
  currentIndex: number;
  correctCount: number;
  earnedPoints: number;
  totalPoints: number;
  gemsAwarded: number | null;
  isCompleting: boolean;
  previousAttempts: { score: number; date: string }[];
  totalTimeSeconds: number;
};

type Action =
  | { type: "START" }
  | { type: "ANSWER"; isCorrect: boolean; points: number; isLast: boolean; totalTimeSeconds: number }
  | { type: "EXERCISE_COMPLETED"; gemsAwarded: number; previousAttempts: { score: number; date: string }[] }
  | { type: "EXERCISE_COMPLETE_ERROR" };

const initialState: State = {
  phase: "intro",
  currentIndex: 0,
  correctCount: 0,
  earnedPoints: 0,
  totalPoints: 0,
  gemsAwarded: null,
  isCompleting: false,
  previousAttempts: [],
  totalTimeSeconds: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { ...state, phase: "questions" };
    case "ANSWER": {
      const newCorrect = action.isCorrect ? state.correctCount + 1 : state.correctCount;
      const newEarned = action.isCorrect ? state.earnedPoints + action.points : state.earnedPoints;
      const newTotal = state.totalPoints + action.points;
      if (action.isLast) {
        return { ...state, correctCount: newCorrect, earnedPoints: newEarned, totalPoints: newTotal, phase: "results", isCompleting: true, totalTimeSeconds: action.totalTimeSeconds };
      }
      return { ...state, correctCount: newCorrect, earnedPoints: newEarned, totalPoints: newTotal, currentIndex: state.currentIndex + 1 };
    }
    case "EXERCISE_COMPLETED":
      return { ...state, gemsAwarded: action.gemsAwarded, previousAttempts: action.previousAttempts, isCompleting: false };
    case "EXERCISE_COMPLETE_ERROR":
      return { ...state, gemsAwarded: 0, isCompleting: false };
    default:
      return state;
  }
}

function ExpressionDisplay({ expression }: { expression: string }) {
  const parts = expression.split("[?]");
  return (
    <span className="font-mono text-xl sm:text-2xl font-bold text-stone-800 dark:text-stone-100">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span
              className="inline-flex items-center justify-center min-w-18 h-9 mx-1.5 rounded-lg border-2 border-dashed border-gray-300 dark:border-stone-500 text-gray-400 dark:text-stone-500 text-sm font-semibold align-middle"
            >
              ___
            </span>
          )}
        </span>
      ))}
    </span>
  );
}

export function MathExercisePlayer({ exercise, answerKey, initialGems, backHref, worldName }: ExerciseProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isPending, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState("");

  const answersRef = useRef<AnswerResult[]>([]);
  const startedAtRef = useRef(0);
  const questionStartRef = useRef(Date.now());

  const { phase, currentIndex, correctCount, earnedPoints, totalPoints, gemsAwarded, isCompleting, previousAttempts, totalTimeSeconds } = state;

  const worldConfig = worldName ? getWorldConfig(worldName) : null;
  const instructionBlocks = (exercise.content.instruction_blocks as InstructionBlock[]) ?? [];
  const questions = (exercise.content.questions as MathQuestion[]) ?? [];
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;

  const handleStart = useCallback(() => {
    startedAtRef.current = Date.now();
    questionStartRef.current = Date.now();
    dispatch({ type: "START" });
  }, []);

  const handleSubmit = useCallback((answer: string) => {
    if (!currentQuestion || !answer.trim()) return;
    const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000);
    const correctAnswer = answerKey[currentQuestion.id] ?? "";
    const isCorrect = answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    const pts = currentQuestion.points || 1;
    const totalTime = Math.round((Date.now() - startedAtRef.current) / 1000);

    answersRef.current.push({
      questionId: currentQuestion.id,
      selectedOptionId: answer.trim(),
      correctOptionId: correctAnswer,
      isCorrect,
      timeSpentSeconds: elapsed,
      timedOut: false,
    });

    setInputValue("");
    questionStartRef.current = Date.now();

    if (isLastQuestion) {
      startTransition(() => {
        completeExercise({
          exerciseId: exercise.id,
          answers: answersRef.current,
          totalQuestions: questions.length,
          correctAnswers: answersRef.current.filter((a) => a.isCorrect).length,
          durationSeconds: totalTime,
        })
          .then(async (result) => {
            const attempts = await getPreviousAttempts(exercise.id).catch(() => [] as { score: number; date: string }[]);
            dispatch({ type: "EXERCISE_COMPLETED", gemsAwarded: result.gemsAwarded, previousAttempts: attempts });
          })
          .catch(() => dispatch({ type: "EXERCISE_COMPLETE_ERROR" }));
      });
    }

    dispatch({ type: "ANSWER", isCorrect, points: pts, isLast: isLastQuestion, totalTimeSeconds: totalTime });
  }, [currentQuestion, isLastQuestion, answerKey, exercise.id, questions.length]);

  if (phase === "intro") {
    return (
      <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}>
        <PhaseIntro
          exercise={exercise}
          worldConfig={null}
          isReadingComprehension={false}
          isTimedReading={false}
          questions={[]}
          wordCount={0}
          backHref={backHref}
          idlScore={exercise.idlScore ?? null}
          onStart={handleStart}
        />
      </motion.div>
    );
  }

  if (phase === "results") {
    const mappedQuestions = questions.map((q) => ({
      id: q.id,
      text: q.stimulus_text ?? q.expression ?? "Pregunta",
      options: (q.options ?? []).map((opt) => ({ id: opt, text: opt })),
      points: q.points,
    }));

    return (
      <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}>
        <PhaseResults
          isTimedReading={false}
          exerciseTitle={exercise.title}
          backHref={backHref}
          isCompleting={isCompleting}
          gemsAwarded={gemsAwarded}
          initialGems={initialGems}
          finalTimeSeconds={0}
          wordsPerMinute={0}
          wordCount={0}
          correctCount={correctCount}
          totalQuestions={questions.length}
          earnedPoints={earnedPoints}
          totalPoints={totalPoints}
          totalTimeSeconds={totalTimeSeconds}
          answers={answersRef.current}
          questions={mappedQuestions}
          previousAttempts={previousAttempts}
        />
      </motion.div>
    );
  }

  const needsInput = currentQuestion?.answer_type === "number_gap_input";
  const isGap = currentQuestion?.answer_type !== "multiple_choice";
  const options = currentQuestion?.options ?? [];

  return (
    <div className="min-h-screen flex flex-col">
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
            <span className="text-sm text-muted-foreground tabular-nums">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-lg mx-auto space-y-5">
          {instructionBlocks.length > 0 && (
            <div className="space-y-3 rounded-2xl border bg-muted/30 p-4">
              {instructionBlocks.map((block) => (
                <div key={block.id}>
                  {block.type === "text" ? (
                    <p className="text-sm text-foreground leading-relaxed">{block.content}</p>
                  ) : block.content ? (
                    <div className="relative w-full h-48 overflow-hidden rounded-xl">
                      <Image src={block.content} alt="Consigna" fill className="object-contain" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {worldConfig ? (
            <div className="flex items-start gap-3">
              <div
                key={`char-${currentIndex}`}
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
              <div
                key={currentIndex}
                className="relative flex-1 rounded-2xl rounded-bl-sm border-2 border-transparent p-4 sm:p-5 animate-in fade-in slide-in-from-left-4 duration-500"
                style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
              >
                <div
                  className="absolute -left-2.5 bottom-5 w-0 h-0"
                  style={{
                    borderTop: "9px solid transparent",
                    borderBottom: "9px solid transparent",
                    borderRight: "12px solid rgba(255,255,255,0.95)",
                  }}
                />
                {currentQuestion?.stimulus_text && (
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3">
                    {currentQuestion.stimulus_text}
                  </p>
                )}
                {currentQuestion?.stimulus_image_url && (
                  <div className="relative w-full h-40 overflow-hidden rounded-xl mb-3">
                    <Image src={currentQuestion.stimulus_image_url} alt="Imagen de la pregunta" fill className="object-contain" />
                  </div>
                )}
                {currentQuestion?.expression && (
                  <ExpressionDisplay expression={currentQuestion.expression} />
                )}
              </div>
            </div>
          ) : (
            <div
              key={currentIndex}
              className="rounded-xl border-2 border-border p-6 animate-in fade-in duration-500"
            >
              {currentQuestion?.stimulus_text && (
                <p className="text-base sm:text-lg font-medium text-foreground leading-snug mb-4">
                  {currentQuestion.stimulus_text}
                </p>
              )}
              {currentQuestion?.stimulus_image_url && (
                <div className="relative w-full h-56 overflow-hidden rounded-xl border mb-4">
                  <Image src={currentQuestion.stimulus_image_url} alt="Imagen de la pregunta" fill className="object-contain" />
                </div>
              )}
              {currentQuestion?.expression && (
                <div
                  className="rounded-2xl bg-white dark:bg-stone-800 border px-5 py-5 text-center"
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                >
                  <ExpressionDisplay expression={currentQuestion.expression} />
                </div>
              )}
            </div>
          )}

          {!isGap && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSubmit(opt)}
                  disabled={isPending}
                  className={cn(
                    "rounded-2xl border-2 px-4 py-5 text-lg font-bold transition-all duration-150",
                    "bg-background hover:bg-muted hover:border-primary/50 active:scale-95",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {isGap && (
        <footer className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4">
          <div className="max-w-lg mx-auto">
            {needsInput ? (
              <form
                onSubmit={(e) => { e.preventDefault(); handleSubmit(inputValue); }}
                className="flex gap-2"
              >
                <Input
                  type="text"
                  inputMode="numeric"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  className="text-center text-lg h-12 flex-1"
                  autoFocus
                />
                <Button
                  type="submit"
                  className="h-12 px-6"
                  disabled={!inputValue.trim() || isPending}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </form>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center min-h-12">
                {options.map((opt, i) => (
                  <button
                    key={`${opt}-${i}`}
                    type="button"
                    disabled={isPending}
                    onClick={() => handleSubmit(opt)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium border-2 transition-all",
                      "active:scale-95 cursor-pointer select-none",
                      "hover:shadow-md border-border bg-background hover:border-foreground/30"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
