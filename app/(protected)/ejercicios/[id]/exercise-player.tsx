"use client";

import { useState, useCallback, useTransition, useRef, useEffect } from "react";
import { checkAnswer, completeExercise, completeTimedReading } from "./actions";
import type { AnswerResult } from "./actions";
import { LetterGapPlayer } from "./letter-gap-player";
import { getScheme } from "@/app/(protected)/ejercicios/(browse)/mundos/world-color-schemes";
import { getWorldConfig } from "@/lib/worlds";
import { PhaseIntro } from "./phase-intro";
import { PhaseReading } from "./phase-reading";
import { PhaseResults } from "./phase-results";
import { PhaseQuestions } from "./phase-questions";

export type Option = {
  id: string;
  text: string;
  image_url?: string | null;
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
  };
  initialGems: number;
  worldId?: string;
  worldName?: string;
  backHref: string;
};

type Phase = "intro" | "reading" | "questions" | "results";

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

export function ExercisePlayer({ exercise, initialGems, worldId, worldName, backHref }: ExerciseProps) {
  if (exercise.typeName === "letter_gap") {
    return <LetterGapPlayer exercise={exercise} initialGems={initialGems} worldId={worldId} worldName={worldName} backHref={backHref} />;
  }
  return <BaseExercisePlayer exercise={exercise} initialGems={initialGems} worldId={worldId} worldName={worldName} backHref={backHref} />;
}

function BaseExercisePlayer({ exercise, initialGems, worldId, worldName, backHref }: ExerciseProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
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
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(0);
  const [readingTimeSeconds, setReadingTimeSeconds] = useState<number | undefined>(undefined);

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

  const worldScheme = worldName ? getScheme(worldName) : null;
  const worldConfig = worldName ? getWorldConfig(worldName) : null;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;

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

  const handleStart = useCallback(() => {
    startedAtRef.current = Date.now();
    if (isReadingComprehension || isTimedReading) {
      setPhase("reading");
    } else {
      setPhase("questions");
    }
  }, [isReadingComprehension, isTimedReading]);

  useEffect(() => {
    if (phase !== "reading") return;
    readingStartRef.current = Date.now();
    if (!isTimedReading) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => s + 1);
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

  const finishExercise = useCallback(() => {
    setPhase("results");
    setIsCompleting(true);
    const durationSeconds = Math.round((Date.now() - startedAtRef.current) / 1000);
    setTotalTimeSeconds(durationSeconds);
    setReadingTimeSeconds(readingTimeRef.current);
    const actualCorrect = answersRef.current.filter((a) => a.isCorrect).length;
    completeExercise({
      exerciseId: exercise.id,
      answers: answersRef.current,
      totalQuestions: questions.length,
      correctAnswers: actualCorrect,
      durationSeconds,
      readingTimeSeconds: readingTimeRef.current,
    })
      .then((result) => {
        setGemsAwarded(result.gemsAwarded);
      })
      .catch(() => setGemsAwarded(0))
      .finally(() => setIsCompleting(false));
  }, [exercise.id, questions.length]);

  const handleFinishReading = useCallback(() => {
    const elapsed = Math.round((Date.now() - readingStartRef.current) / 1000);
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

  const handleCheck = useCallback((optionId: string) => {
    if (!currentQuestion) return;
    const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000);
    const timedOut = elapsed > 30;
    startTransition(async () => {
      const result = await checkAnswer(exercise.id, currentQuestion.id, optionId);
      answersRef.current.push({
        questionId: currentQuestion.id,
        selectedOptionId: optionId,
        correctOptionId: result.correctOptionId,
        isCorrect: result.isCorrect,
        timeSpentSeconds: elapsed,
        timedOut,
      });
      const pts = currentQuestion.points || 1;
      setTotalPoints((p) => p + pts);
      if (result.isCorrect) {
        setCorrectCount((c) => c + 1);
        setEarnedPoints((p) => p + pts);
      }
      if (isLastQuestion) {
        finishExercise();
      } else {
        setCurrentIndex((i) => i + 1);
        setSelectedOptionId(null);
      }
    });
  }, [currentQuestion, exercise.id, isLastQuestion, finishExercise]);

  if (phase === "intro") {
    return (
      <PhaseIntro
        exercise={exercise}
        worldBg={worldBg}
        worldConfig={worldConfig}
        isReadingComprehension={isReadingComprehension}
        isTimedReading={isTimedReading}
        questions={questions}
        wordCount={wordCount}
        backHref={backHref}
        onStart={handleStart}
      />
    );
  }

  if (phase === "reading") {
    return (
      <PhaseReading
        readingText={readingText}
        readingAudioUrl={readingAudioUrl}
        isTimedReading={isTimedReading}
        showTimer={showTimer}
        timerSeconds={timerSeconds}
        worldConfig={worldConfig}
        activeParagraph={activeParagraph}
        onActiveParagraphChange={setActiveParagraph}
        onBack={() => setPhase("intro")}
        onDone={isTimedReading ? handleFinishReading : () => {
          readingTimeRef.current = Math.round((Date.now() - readingStartRef.current) / 1000);
          setPhase("questions");
        }}
      />
    );
  }

  if (phase === "results") {
    return (
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
        readingTimeSeconds={readingTimeSeconds}
      />
    );
  }

  return (
    <PhaseQuestions
      worldBg={worldBg}
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
        setSelectedOptionId(optionId);
        handleCheck(optionId);
      }}
    />
  );
}
