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

const textDifficultyLabels: Record<string, string> = {
  simple: "Texto: Simple",
  moderado: "Texto: Moderado",
  complejo: "Texto: Complejo",
};

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
  onStart,
}: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-semibold transition-colors px-3 py-1.5 rounded-xl bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-6 pt-0">
        <div className="w-full max-w-lg text-center space-y-1">
          {worldConfig && (
            <div className="flex justify-center">
              <Image
                src={worldConfig.characterImage}
                alt=""
                width={320}
                height={320}
                className="w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] object-contain animate-fade-in-up drop-shadow-2xl"
              />
            </div>
          )}
          <div className="space-y-3">
            <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full border border-border text-muted-foreground">
              {exercise.typeDisplayName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {exercise.title}
            </h1>
            <p className="font-semibold text-foreground/80">
              {exercise.instructions}
            </p>
            {exercise.instructionsAudioUrl && (
              <div className="mt-6 flex justify-center">
                <AudioPlayer src={exercise.instructionsAudioUrl} />
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
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
      </main>
    </div>
  );
}
