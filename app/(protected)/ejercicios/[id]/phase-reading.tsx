"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
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
  Volume2,
  VolumeX,
} from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";
import type { WorldConfig } from "@/lib/worlds";

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function parseTextToParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((block) =>
      block
        .split(/\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .join(" ")
    )
    .filter(Boolean);
}

function detectWordList(text: string): boolean {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 4) return false;
  const shortLines = lines.filter((l) => l.trim().split(/\s+/).length <= 2);
  return shortLines.length / lines.length >= 0.6;
}

function parseWordList(text: string): string[] {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
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
  const { speak, stop, isSpeaking, isSupported } = useSpeech();
  const [speakingMode, setSpeakingMode] = useState<"all" | "paragraph" | null>(null);

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
    el.scrollBy({ top: direction === "down" ? el.clientHeight - 80 : -(el.clientHeight - 80), behavior: "smooth" });
  }, []);

  const paragraphs = useMemo(() => parseTextToParagraphs(readingText), [readingText]);
  const hasMultipleParagraphs = paragraphs.length > 1;
  const isWordList = useMemo(() => detectWordList(readingText), [readingText]);
  const wordListItems = useMemo(() => isWordList ? parseWordList(readingText) : [], [isWordList, readingText]);

  useEffect(() => {
    if (!isSpeaking) setSpeakingMode(null);
  }, [isSpeaking]);

  useEffect(() => {
    stop();
    setSpeakingMode(null);
  }, [activeParagraph, stop]);

  useEffect(() => () => stop(), [stop]);

  const handleSpeakAll = useCallback(() => {
    if (speakingMode === "all" && isSpeaking) {
      stop();
      setSpeakingMode(null);
    } else {
      stop();
      setSpeakingMode("all");
      speak(paragraphs.join(" "));
    }
  }, [speakingMode, isSpeaking, stop, speak, paragraphs]);

  const handleSpeakParagraph = useCallback(() => {
    if (activeParagraph === null) return;
    if (speakingMode === "paragraph" && isSpeaking) {
      stop();
      setSpeakingMode(null);
    } else {
      stop();
      setSpeakingMode("paragraph");
      speak(paragraphs[activeParagraph]);
    }
  }, [activeParagraph, speakingMode, isSpeaking, stop, speak, paragraphs]);

  return (
    <div
      className="h-screen flex flex-col relative"
      style={{ background: "#ffffff", color: "#1a1a1a", fontFamily: "'Lexend', sans-serif" }}
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

        <div className="flex items-center gap-2">
          {isSupported && activeParagraph !== null && (
            <button
              type="button"
              onClick={handleSpeakParagraph}
              aria-label={speakingMode === "paragraph" && isSpeaking ? "Detener lectura del párrafo" : "Escuchar párrafo"}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer",
                speakingMode === "paragraph" && isSpeaking
                  ? "text-white"
                  : "text-neutral-600 bg-neutral-100 hover:bg-neutral-200"
              )}
              style={speakingMode === "paragraph" && isSpeaking ? { backgroundColor: accentColor, color: accentFg } : undefined}
            >
              {speakingMode === "paragraph" && isSpeaking
                ? <VolumeX className="h-3.5 w-3.5" strokeWidth={2} />
                : <Volume2 className="h-3.5 w-3.5" strokeWidth={2} />}
              Párrafo
            </button>
          )}
          {isSupported && (
            <button
              type="button"
              onClick={handleSpeakAll}
              aria-label={speakingMode === "all" && isSpeaking ? "Detener lectura" : "Escuchar todo"}
              className={cn(
                "p-2 rounded-lg transition-colors cursor-pointer",
                speakingMode === "all" && isSpeaking
                  ? "text-neutral-800 bg-neutral-100"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
              )}
            >
              {speakingMode === "all" && isSpeaking
                ? <VolumeX className="h-5 w-5" strokeWidth={2} />
                : <Volume2 className="h-5 w-5" strokeWidth={2} />}
            </button>
          )}
          {isTimedReading && showTimer && (
            <div className="flex items-center gap-1.5 text-neutral-400">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span className="text-sm font-mono tabular-nums tracking-tight">
                {formatTimer(timerSeconds)}
              </span>
            </div>
          )}
        </div>
      </header>

      <main
        ref={scrollContainerRef}
        onClick={() => onActiveParagraphChange(null)}
        className="flex-1 min-h-0 overflow-y-auto px-6 py-8 sm:px-10 md:px-16 sm:py-10"
      >
        <div className="max-w-[560px] mx-auto">
          {readingAudioUrl && (
            <div className="flex justify-center mb-8">
              <AudioPlayer src={readingAudioUrl} autoPlay={false} />
            </div>
          )}

          <div className={cn("space-y-6", !hasMultipleParagraphs && "space-y-0")}>
            {isWordList ? (
              <div className="columns-2 sm:columns-3 gap-x-6">
                {wordListItems.map((word, idx) => (
                  <p
                    key={idx}
                    className="text-[19px] sm:text-[21px] md:text-[23px] leading-[2.1] tracking-[0.01em] break-inside-avoid text-neutral-700"
                    style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 300 }}
                  >
                    {word}
                  </p>
                ))}
              </div>
            ) : (
              paragraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onActiveParagraphChange(idx === activeParagraph ? null : idx);
                  }}
                  className={cn(
                    "leading-[1.9] tracking-[0.01em] cursor-pointer transition-colors duration-200 select-none",
                    "text-[19px] sm:text-[21px] md:text-[23px]",
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
              ))
            )}
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
            canScrollUp ? "cursor-pointer hover:opacity-90 hover:shadow-lg" : "opacity-0 pointer-events-none"
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
            canScrollDown ? "cursor-pointer hover:opacity-90 hover:shadow-lg" : "opacity-0 pointer-events-none"
          )}
          style={{ backgroundColor: accentColor, color: accentFg }}
        >
          <ChevronDown className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      <footer className="flex-shrink-0 px-4 py-3 bg-white border-t border-neutral-100 z-10">
        <div className="max-w-[560px] mx-auto flex items-center justify-between lg:justify-end">
          <div className="flex items-center gap-1.5 lg:hidden">
            <button
              type="button"
              onClick={() => scrollByViewport("up")}
              disabled={!canScrollUp}
              aria-label="Subir"
              className={cn(
                "p-1.5 rounded-full shadow-sm transition-all duration-200",
                canScrollUp ? "cursor-pointer hover:opacity-90" : "opacity-20 pointer-events-none"
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
                canScrollDown ? "cursor-pointer hover:opacity-90" : "opacity-20 pointer-events-none"
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
              tabIndex={-1}
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
              tabIndex={-1}
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