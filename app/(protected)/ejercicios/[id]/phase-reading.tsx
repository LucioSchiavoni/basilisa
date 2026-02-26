"use client";

import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/ui/audio-player";
import { cn } from "@/lib/utils";
import { ArrowLeft, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import type { WorldConfig } from "@/lib/worlds";

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type Props = {
  readingText: string;
  readingAudioUrl: string | null;
  isTimedReading: boolean;
  showTimer: boolean;
  timerSeconds: number;
  worldConfig: WorldConfig | null;
  activeParagraph: number | null;
  onActiveParagraphChange: (idx: number | null) => void;
  onBack: () => void;
  onDone: () => void;
};

export function PhaseReading({
  readingText,
  readingAudioUrl,
  isTimedReading,
  showTimer,
  timerSeconds,
  worldConfig,
  activeParagraph,
  onActiveParagraphChange,
  onBack,
  onDone,
}: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <header className="sticky top-0 z-10 bg-white border-b p-4">
        <div className="max-w-prose mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
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
            <p className="text-sm font-medium text-gray-900">Lee el siguiente texto con atención</p>
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
                  onClick={() => onActiveParagraphChange(idx === activeParagraph ? null : idx)}
                  onTouchStart={() => onActiveParagraphChange(idx === activeParagraph ? null : idx)}
                  className={cn(
                    "text-lg sm:text-xl leading-loose tracking-wide cursor-pointer px-1 py-1 transition-colors duration-200 select-none font-light",
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
              onClick={onDone}
              style={worldConfig ? { backgroundColor: worldConfig.accentColor, color: "#fff" } : undefined}
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Terminé de leer
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full text-base h-12"
              onClick={onDone}
              style={worldConfig ? { backgroundColor: worldConfig.accentColor, color: "#fff" } : undefined}
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
