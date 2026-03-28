"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/ui/audio-player";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
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
  const accentColor = worldConfig?.accentColor ?? "#2E85C8";
  const accentFg = worldConfig?.accentFg ?? "#ffffff";

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 8;
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - threshold);
    setCanScrollUp(el.scrollTop > threshold);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScroll();

    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);
    el.addEventListener("scroll", checkScroll, { passive: true });

    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", checkScroll);
    };
  }, [checkScroll, readingText]);

  const scrollByViewport = useCallback((direction: "down" | "up") => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const overlap = 80;
    const step = el.clientHeight - overlap;

    el.scrollBy({
      top: direction === "down" ? step : -step,
      behavior: "smooth",
    });
  }, []);

  return (
    <div
      className="h-screen flex flex-col relative"
      style={{
        background: "#ffffff",
        color: "#1a1a1a",
        fontFamily: "'Lexend', sans-serif",
      }}
    >
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100 z-10">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver"
          className="p-2 -ml-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-6 w-6" strokeWidth={2.5} />
        </button>

        {isTimedReading && showTimer && (
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="text-sm font-mono tabular-nums tracking-tight">
              {formatTimer(timerSeconds)}
            </span>
          </div>
        )}
      </header>

      <main
        ref={scrollContainerRef}
        onClick={() => onActiveParagraphChange(null)}
        className="flex-1 min-h-0 overflow-y-auto px-6 py-6 sm:px-10 md:px-16 sm:py-8"
      >
        <div className="max-w-[540px] mx-auto space-y-5">
          {readingAudioUrl && (
            <div className="flex justify-center">
              <AudioPlayer src={readingAudioUrl} />
            </div>
          )}

          <div className="space-y-4">
            {readingText
              .split(/\n+/)
              .filter((p) => p.trim())
              .map((paragraph, idx) => (
                <p
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onActiveParagraphChange(idx === activeParagraph ? null : idx);
                  }}
                  className={cn(
                    "text-[19px] sm:text-[22px] md:text-[24px] lg:text-[26px] leading-[1.85] tracking-[0.01em] cursor-pointer transition-colors duration-200 select-none",
                    idx === activeParagraph
                      ? "text-neutral-900"
                      : activeParagraph !== null
                        ? "text-neutral-300"
                        : "text-neutral-700"
                  )}
                  style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 300 }}
                >
                  {paragraph}
                </p>
              ))}
          </div>
        </div>
      </main>

      <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-20 flex-col gap-2">
        <button
          type="button"
          onClick={() => scrollByViewport("up")}
          disabled={!canScrollUp}
          aria-label="Subir"
          className={cn(
            "p-3 rounded-full shadow-md transition-all duration-200",
            canScrollUp
              ? "cursor-pointer hover:opacity-90 hover:shadow-lg"
              : "opacity-0 pointer-events-none"
          )}
          style={{ backgroundColor: accentColor, color: accentFg }}
        >
          <ChevronUp className="h-5 w-5" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => scrollByViewport("down")}
          disabled={!canScrollDown}
          aria-label="Bajar"
          className={cn(
            "p-3 rounded-full shadow-md transition-all duration-200",
            canScrollDown
              ? "cursor-pointer hover:opacity-90 hover:shadow-lg"
              : "opacity-0 pointer-events-none"
          )}
          style={{ backgroundColor: accentColor, color: accentFg }}
        >
          <ChevronDown className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      <footer className="flex-shrink-0 px-4 py-3 bg-white border-t border-neutral-100 z-10">
        <div className="max-w-[540px] mx-auto flex items-center justify-between lg:justify-end">
          <div className="flex items-center gap-1.5 lg:hidden">
            <button
              type="button"
              onClick={() => scrollByViewport("up")}
              disabled={!canScrollUp}
              aria-label="Subir"
              className={cn(
                "p-1.5 rounded-full shadow-sm transition-all duration-200",
                canScrollUp
                  ? "cursor-pointer hover:opacity-90"
                  : "opacity-20 pointer-events-none"
              )}
              style={{ backgroundColor: accentColor, color: accentFg }}
            >
              <ChevronUp className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => scrollByViewport("down")}
              disabled={!canScrollDown}
              aria-label="Bajar"
              className={cn(
                "p-1.5 rounded-full shadow-sm transition-all duration-200",
                canScrollDown
                  ? "cursor-pointer hover:opacity-90"
                  : "opacity-20 pointer-events-none"
              )}
              style={{ backgroundColor: accentColor, color: accentFg }}
            >
              <ChevronDown className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          {isTimedReading ? (
            <Button
              size="sm"
              onClick={onDone}
              className="gap-1.5 rounded-full px-5 h-10 text-sm font-normal"
              style={{ backgroundColor: accentColor, color: accentFg }}
            >
              <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
              Terminé de leer
            </Button>
          ) : (
            <button
              type="button"
              onClick={onDone}
              className="inline-flex items-center gap-1 text-sm font-normal transition-colors rounded-full px-5 py-2.5 hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: accentColor, color: accentFg }}
            >
              Continuar
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}