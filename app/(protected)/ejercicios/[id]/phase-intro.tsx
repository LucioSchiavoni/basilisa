"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/ui/audio-player";
import { ArrowLeft, BarChart3, BookOpen, ChevronRight } from "lucide-react";
import type { WorldConfig } from "@/lib/worlds";
import type { Question } from "./exercise-player";

const difficultyLabels: Record<number, string> = {
  1: "Muy fácil",
  2: "Fácil",
  3: "Intermedio",
  4: "Difícil",
  5: "Muy difícil",
};

function getIdlLabel(score: number): string {
  if (score < 20) return "Nivel inicial";
  if (score < 40) return "Nivel medio";
  if (score < 60) return "Nivel avanzado";
  return "Nivel experto";
}

type Props = {
  exercise: {
    title: string;
    typeDisplayName: string;
    instructions: string;
    instructionsAudioUrl: string | null;
    difficultyLevel: number;
    content: Record<string, unknown>;
  };
  worldConfig: WorldConfig | null;
  isReadingComprehension: boolean;
  isTimedReading: boolean;
  questions: Question[];
  wordCount: number;
  backHref: string;
  idlScore: number | null;
  onStart: () => void;
};

export function PhaseIntro({
  exercise,
  worldConfig,
  isReadingComprehension,
  isTimedReading,
  questions,
  wordCount,
  backHref,
  idlScore,
  onStart,
}: Props) {
  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      <header className="shrink-0 p-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-semibold transition-colors px-3 py-1.5 rounded-xl bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-4 overflow-hidden">
        <div className="w-full max-w-4xl flex flex-col lg:flex-row items-center gap-4 lg:gap-12 text-center lg:text-left">
          {worldConfig && (
            <div className="flex justify-center lg:flex-1">
              <Image
                src={worldConfig.characterImage}
                alt=""
                width={420}
                height={420}
                className="w-44 h-44 sm:w-56 sm:h-56 lg:w-80 lg:h-80 object-contain animate-fade-in-up drop-shadow-2xl"
              />
            </div>
          )}
          <div className="lg:flex-1 space-y-3 lg:space-y-5">
            <div className="space-y-3">
              <span className="inline-block text-sm font-medium px-2.5 py-1 rounded-full border border-border text-muted-foreground">
                {exercise.typeDisplayName}
              </span>
              <h1 className="text-3xl sm:text-4xl font-semibold text-foreground" style={{ fontFamily: "var(--font-lexend)" }}>
                {exercise.title}
              </h1>
              <p className="font-normal text-base sm:text-lg text-muted-foreground">
                {exercise.instructions}
              </p>
              {exercise.instructionsAudioUrl && (
                <div className="flex justify-center lg:justify-start">
                  <AudioPlayer src={exercise.instructionsAudioUrl} />
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-base text-muted-foreground">
              {idlScore !== null && (isReadingComprehension || isTimedReading) ? (
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {getIdlLabel(idlScore)}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4" />
                  {difficultyLabels[exercise.difficultyLevel]}
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
            <Button
              size="lg"
              className="w-full max-w-xs text-base h-12 font-bold cursor-pointer"
              onClick={onStart}
              style={worldConfig ? { backgroundColor: worldConfig.accentColor, color: worldConfig.accentFg } : undefined}
            >
              Comenzar
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
