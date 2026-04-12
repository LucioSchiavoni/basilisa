"use client";

import { useReducer, useCallback, useTransition, useRef, useEffect } from "react";
import { completeExercise, completeTimedReading, getPreviousAttempts } from "./actions";
import { calculateMaxReadingTime, getExerciseWordCount, EXPECTED_READING_SPEEDS } from "@/lib/constants/reading-speeds";
import type { AnswerResult } from "./actions";
import { LetterGapPlayer } from "./letter-gap-player";
import { getWorldConfig } from "@/lib/worlds";
import { PhaseIntro } from "./phase-intro";
import { PhaseReading } from "./phase-reading";
import { PhaseResults } from "./phase-results";
import { PhaseQuestions } from "./phase-questions";
import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";

const pageEase: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const pageVariants: Variants = {
  initial: { x: 60, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.38, ease: pageEase } },
  exit: { x: -60, opacity: 0, transition: { duration: 0.28, ease: "easeIn" } },
};

export type Option = {
  id: string;
  text: string;
  image_url?: string | null;
  audio_label?: string | null;
};

export type Question = {
  id: string;
  text: string;
  description?: string | null;
  question_image_url?: string | null;
  question_audio_url?: string | null;
  options: Option[];
  points: number;
};

export type ExerciseProps = {
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
    idlScore?: number | null;
  };
  answerKey: Record<string, string>;
  initialGems: number;
  gradeYear?: number | null;
  worldId?: string;
  worldName?: string;
  backHref: string;
};

type Phase = "intro" | "reading" | "questions" | "results";

type ExerciseState = {
  phase: Phase;
  currentIndex: number;
  selectedOptionId: string | null;
  correctCount: number;
  totalPoints: number;
  earnedPoints: number;
  gemsAwarded: number | null;
  isCompleting: boolean;
  previousAttempts: { score: number; date: string }[];
  timerSeconds: number;
  finalTimeSeconds: number;
  wordsPerMinute: number;
  activeParagraph: number | null;
  totalTimeSeconds: number;
  readingTimeSeconds: number | undefined;
};

type ExerciseAction =
  | { type: "START"; toReading: boolean }
  | { type: "BACK_TO_INTRO" }
  | { type: "START_QUESTIONS"; readingTimeSeconds: number }
  | { type: "TICK_TIMER" }
  | { type: "SET_ACTIVE_PARAGRAPH"; paragraph: number | null }
  | { type: "SELECT_OPTION"; optionId: string }
  | { type: "ANSWER_QUESTION"; isCorrect: boolean; points: number; isLast: boolean; totalTimeSeconds: number; readingTimeSeconds: number | undefined }
  | { type: "FINISH_TIMED_READING"; elapsed: number; wpm: number; totalTime: number }
  | { type: "EXERCISE_COMPLETED"; gemsAwarded: number; previousAttempts: { score: number; date: string }[] }
  | { type: "EXERCISE_COMPLETE_ERROR" };

const initialExerciseState: ExerciseState = {
  phase: "intro",
  currentIndex: 0,
  selectedOptionId: null,
  correctCount: 0,
  totalPoints: 0,
  earnedPoints: 0,
  gemsAwarded: null,
  isCompleting: false,
  previousAttempts: [],
  timerSeconds: 0,
  finalTimeSeconds: 0,
  wordsPerMinute: 0,
  activeParagraph: null,
  totalTimeSeconds: 0,
  readingTimeSeconds: undefined,
};

function exerciseReducer(state: ExerciseState, action: ExerciseAction): ExerciseState {
  switch (action.type) {
    case "START":
      return { ...state, phase: action.toReading ? "reading" : "questions" };
    case "BACK_TO_INTRO":
      return { ...state, phase: "intro" };
    case "START_QUESTIONS":
      return { ...state, phase: "questions", readingTimeSeconds: action.readingTimeSeconds };
    case "TICK_TIMER":
      return { ...state, timerSeconds: state.timerSeconds + 1 };
    case "SET_ACTIVE_PARAGRAPH":
      return { ...state, activeParagraph: action.paragraph };
    case "SELECT_OPTION":
      return { ...state, selectedOptionId: action.optionId };
    case "ANSWER_QUESTION": {
      const newCorrect = action.isCorrect ? state.correctCount + 1 : state.correctCount;
      const newEarned = action.isCorrect ? state.earnedPoints + action.points : state.earnedPoints;
      const newTotal = state.totalPoints + action.points;
      if (action.isLast) {
        return {
          ...state,
          correctCount: newCorrect,
          earnedPoints: newEarned,
          totalPoints: newTotal,
          selectedOptionId: null,
          phase: "results",
          isCompleting: true,
          totalTimeSeconds: action.totalTimeSeconds,
          readingTimeSeconds: action.readingTimeSeconds,
        };
      }
      return {
        ...state,
        correctCount: newCorrect,
        earnedPoints: newEarned,
        totalPoints: newTotal,
        currentIndex: state.currentIndex + 1,
        selectedOptionId: null,
      };
    }
    case "FINISH_TIMED_READING":
      return {
        ...state,
        phase: "results",
        isCompleting: true,
        finalTimeSeconds: action.elapsed,
        wordsPerMinute: action.wpm,
        totalTimeSeconds: action.totalTime,
      };
    case "EXERCISE_COMPLETED":
      return {
        ...state,
        gemsAwarded: action.gemsAwarded,
        previousAttempts: action.previousAttempts,
        isCompleting: false,
      };
    case "EXERCISE_COMPLETE_ERROR":
      return { ...state, gemsAwarded: 0, isCompleting: false };
    default:
      return state;
  }
}

function getQuestions(content: Record<string, unknown>): Question[] {
  return (content.questions as Question[]) || [];
}

function getReadingText(content: Record<string, unknown>): string {
  return (content.reading_text as string) || "";
}

function getReadingAudioUrl(content: Record<string, unknown>): string | null {
  return (content.reading_audio_url as string) || null;
}

function getWordCount(content: Record<string, unknown>): number {
  return (content.word_count as number) || 0;
}

export function ExercisePlayer({ exercise, answerKey, initialGems, gradeYear, worldId, worldName, backHref }: ExerciseProps) {
  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {exercise.typeName === "letter_gap" ? (
        <LetterGapPlayer exercise={exercise} initialGems={initialGems} worldId={worldId} worldName={worldName} backHref={backHref} />
      ) : (
        <BaseExercisePlayer exercise={exercise} answerKey={answerKey} initialGems={initialGems} gradeYear={gradeYear} worldId={worldId} worldName={worldName} backHref={backHref} />
      )}
    </motion.div>
  );
}

function BaseExercisePlayer({ exercise, answerKey, initialGems, gradeYear, worldName, backHref }: ExerciseProps) {
  const [state, dispatch] = useReducer(exerciseReducer, initialExerciseState);
  const [isPending, startTransition] = useTransition();

  const {
    phase,
    currentIndex,
    selectedOptionId,
    correctCount,
    totalPoints,
    earnedPoints,
    gemsAwarded,
    isCompleting,
    previousAttempts,
    timerSeconds,
    finalTimeSeconds,
    wordsPerMinute,
    activeParagraph,
    totalTimeSeconds,
    readingTimeSeconds,
  } = state;

  const answersRef = useRef<AnswerResult[]>([]);
  const startedAtRef = useRef(0);
  const readingStartRef = useRef<number>(0);
  const readingTimeRef = useRef<number | undefined>(undefined);
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const questionStartRef = useRef<number>(Date.now());

  const questions = getQuestions(exercise.content);
  const isReadingComprehension = exercise.typeName === "reading_comprehension";
  const isTimedReading = exercise.typeName === "timed_reading";
  const readingText =
    isReadingComprehension || isTimedReading ? getReadingText(exercise.content) : "";
  const readingAudioUrl =
    isReadingComprehension || isTimedReading ? getReadingAudioUrl(exercise.content) : null;
  const wordCount = isTimedReading ? getWordCount(exercise.content) : 0;
  const showTimer = isTimedReading
    ? (exercise.content.show_timer as boolean) !== false
    : false;
  const hideTextDuringQuestions = isReadingComprehension
    ? (exercise.content.hide_text_during_questions as boolean) === true
    : true;

  const exerciseReadingType: "text" | "word_list" =
    isReadingComprehension || isTimedReading ? "text" : "word_list";
  const exerciseWordCount = getExerciseWordCount(exercise.content);
  const maxReadingTime =
    exerciseWordCount !== null
      ? calculateMaxReadingTime(exerciseWordCount, gradeYear ?? 1, exerciseReadingType)
      : 30;

  const grade = Math.min(Math.max(gradeYear ?? 1, 1), 6);
  const expectedPPM = EXPECTED_READING_SPEEDS[grade][exerciseReadingType === "text" ? "textPPM" : "wordListPPM"];
  const readingWordCount = exerciseWordCount ?? wordCount ?? 0;

  const worldConfig = worldName ? getWorldConfig(worldName) : null;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;

  const handleStart = useCallback(() => {
    startedAtRef.current = Date.now();
    dispatch({ type: "START", toReading: isReadingComprehension || isTimedReading });
  }, [isReadingComprehension, isTimedReading]);

  useEffect(() => {
    if (phase !== "reading") return;
    readingStartRef.current = Date.now();
    if (!isTimedReading) return;
    const interval = setInterval(() => {
      dispatch({ type: "TICK_TIMER" });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, isTimedReading]);

  useEffect(() => {
    if (phase === "questions") {
      questionStartRef.current = Date.now();
    }
  }, [phase, currentIndex]);

  useEffect(() => {
    const container = audioContainerRef.current;
    if (!container) return;
    const audios = container.querySelectorAll("audio");
    audios.forEach((audio) => {
      if (!audio.paused) audio.pause();
    });
  }, [currentIndex]);

  const finishExercise = useCallback((durationSeconds: number) => {
    completeExercise({
      exerciseId: exercise.id,
      answers: answersRef.current,
      totalQuestions: questions.length,
      correctAnswers: answersRef.current.filter((a) => a.isCorrect).length,
      durationSeconds,
      readingTimeSeconds: readingTimeRef.current,
    })
      .then(async (result) => {
        const attempts = await getPreviousAttempts(exercise.id).catch(() => [] as { score: number; date: string }[]);
        dispatch({ type: "EXERCISE_COMPLETED", gemsAwarded: result.gemsAwarded, previousAttempts: attempts });
      })
      .catch(() => dispatch({ type: "EXERCISE_COMPLETE_ERROR" }));
  }, [exercise.id, questions.length]);

  const handleFinishReading = useCallback(() => {
    const elapsed = Math.round((Date.now() - readingStartRef.current) / 1000);
    const wpm = Math.round((wordCount / Math.max(elapsed, 1)) * 60);
    const totalTime = Math.round((Date.now() - startedAtRef.current) / 1000);
    dispatch({ type: "FINISH_TIMED_READING", elapsed, wpm, totalTime });
    completeTimedReading({
      exerciseId: exercise.id,
      timeSeconds: elapsed,
      wordCount,
      wordsPerMinute: wpm,
    })
      .then(async (result) => {
        const attempts = await getPreviousAttempts(exercise.id).catch(() => [] as { score: number; date: string }[]);
        dispatch({ type: "EXERCISE_COMPLETED", gemsAwarded: result.gemsAwarded, previousAttempts: attempts });
      })
      .catch(() => dispatch({ type: "EXERCISE_COMPLETE_ERROR" }));
  }, [exercise.id, wordCount]);

  const handleCheck = useCallback((optionId: string) => {
    if (!currentQuestion) return;
    const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000);
    const timedOut = elapsed > maxReadingTime;
    const correctOptionId = answerKey[currentQuestion.id] ?? "";
    const isCorrect = optionId === correctOptionId;
    answersRef.current.push({
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
      correctOptionId,
      isCorrect,
      timeSpentSeconds: elapsed,
      timedOut,
    });
    const pts = currentQuestion.points || 1;
    const durationSeconds = Math.round((Date.now() - startedAtRef.current) / 1000);
    startTransition(() => {
      dispatch({
        type: "ANSWER_QUESTION",
        isCorrect,
        points: pts,
        isLast: isLastQuestion,
        totalTimeSeconds: durationSeconds,
        readingTimeSeconds: readingTimeRef.current,
      });
    });
    if (isLastQuestion) {
      finishExercise(durationSeconds);
    }
  }, [currentQuestion, answerKey, isLastQuestion, finishExercise, maxReadingTime]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen"
      >
        {phase === "intro" && (
          <PhaseIntro
            exercise={exercise}
            worldConfig={worldConfig}
            isReadingComprehension={isReadingComprehension}
            isTimedReading={isTimedReading}
            questions={questions}
            wordCount={wordCount}
            backHref={backHref}
            idlScore={exercise.idlScore ?? null}
            onStart={handleStart}
          />
        )}
        {phase === "reading" && (
          <PhaseReading
            readingText={readingText}
            readingAudioUrl={readingAudioUrl}
            isTimedReading={isTimedReading}
            showTimer={showTimer}
            timerSeconds={timerSeconds}
            worldConfig={worldConfig}
            activeParagraph={activeParagraph}
            onActiveParagraphChange={(p) => dispatch({ type: "SET_ACTIVE_PARAGRAPH", paragraph: p })}
            onBack={() => dispatch({ type: "BACK_TO_INTRO" })}
            onDone={isTimedReading ? handleFinishReading : () => {
              const readingTime = Math.round((Date.now() - readingStartRef.current) / 1000);
              readingTimeRef.current = readingTime;
              dispatch({ type: "START_QUESTIONS", readingTimeSeconds: readingTime });
            }}
          />
        )}
        {phase === "results" && (
          <PhaseResults
            isTimedReading={isTimedReading}
            exerciseTitle={exercise.title}
            backHref={backHref}
            isCompleting={isCompleting}
            gemsAwarded={gemsAwarded}
            finalTimeSeconds={finalTimeSeconds}
            wordsPerMinute={wordsPerMinute}
            wordCount={wordCount}
            correctCount={correctCount}
            totalQuestions={questions.length}
            earnedPoints={earnedPoints}
            totalPoints={totalPoints}
            totalTimeSeconds={totalTimeSeconds}
            answers={answersRef.current}
            questions={questions}
            initialGems={initialGems}
            previousAttempts={previousAttempts}
            readingTimeSeconds={readingTimeSeconds}
            maxReadingTime={maxReadingTime}
            expectedPPM={expectedPPM}
            readingWordCount={readingWordCount}
          />
        )}
        {phase === "questions" && (
          <PhaseQuestions
            worldConfig={worldConfig}
            audioContainerRef={audioContainerRef}
            activeQuestion={currentQuestion}
            activeIndex={currentIndex}
            activeTotal={questions.length}
            activeProgress={progress}
            selectedOptionId={selectedOptionId}
            isPending={isPending}
            isReadingComprehension={isReadingComprehension}
            hideTextDuringQuestions={hideTextDuringQuestions}
            readingText={readingText}
            backHref={backHref}
            onOptionClick={(optionId) => {
              dispatch({ type: "SELECT_OPTION", optionId });
              handleCheck(optionId);
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
