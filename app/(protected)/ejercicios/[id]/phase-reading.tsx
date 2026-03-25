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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="max-w-prose mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-sm font-semibold transition-colors px-3 py-1.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          {isTimedReading ? (
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Lee a tu ritmo</p>
              {showTimer && (
                <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-mono font-semibold tabular-nums text-foreground">
                    {formatTimer(timerSeconds)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm font-medium text-foreground">Lee el siguiente texto con atención</p>
          )}
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-prose mx-auto space-y-4">
          {readingAudioUrl && (
            <div className="flex justify-center py-2">
              <AudioPlayer src={readingAudioUrl} />
            </div>
          )}
          <div className="space-y-2" style={{ fontFamily: "'Lexend', sans-serif" }}>
            {readingText.split(/\n+/).filter((p) => p.trim()).map((paragraph, idx) => (
              <div key={idx} className="relative">
                <p
                  onClick={() => onActiveParagraphChange(idx === activeParagraph ? null : idx)}
                  onTouchStart={() => onActiveParagraphChange(idx === activeParagraph ? null : idx)}
                  className={cn(
                    "text-base leading-relaxed tracking-normal cursor-pointer px-1 py-0.5 transition-colors duration-200 select-none font-light",
                    idx === activeParagraph ? "text-foreground" : "text-muted-foreground"
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
              style={worldConfig ? { backgroundColor: worldConfig.accentColor, color: worldConfig.accentFg } : undefined}
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Terminé de leer
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full text-base h-12"
              onClick={onDone}
              style={worldConfig ? { backgroundColor: worldConfig.accentColor, color: worldConfig.accentFg } : undefined}
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
