"use client";

import { type RefObject, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { AudioPlayer } from "@/components/ui/audio-player";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BookOpen, Loader2, Volume2, VolumeX, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useSpeech } from "@/hooks/use-speech";
import type { WorldConfig } from "@/lib/worlds";
import type { Question, Option } from "./exercise-player";

type Props = {
  worldConfig: WorldConfig | null;
  audioContainerRef: RefObject<HTMLDivElement | null>;
  activeQuestion: Question | null;
  activeIndex: number;
  activeTotal: number;
  activeProgress: number;
  selectedOptionId: string | null;
  isPending: boolean;
  isReadingComprehension: boolean;
  hideTextDuringQuestions: boolean;
  readingText: string;
  backHref: string;
  onOptionClick: (optionId: string) => void;
};

export function PhaseQuestions({
  worldConfig,
  audioContainerRef,
  activeQuestion,
  activeIndex,
  activeTotal,
  activeProgress,
  selectedOptionId,
  isPending,
  isReadingComprehension,
  hideTextDuringQuestions,
  readingText,
  backHref,
  onOptionClick,
}: Props) {
  const [loadedUrls, setLoadedUrls] = useState<Set<string>>(new Set());
  const [speakingOptionId, setSpeakingOptionId] = useState<string | null>(null);
  const { speak, stop, isSpeaking, isSupported } = useSpeech();

  function handleAudioClick(e: React.MouseEvent, option: Option, index: number) {
    e.stopPropagation();
    const text = option.audio_label || `Opción ${index + 1}`;
    if (speakingOptionId === option.id && isSpeaking) {
      stop();
      setSpeakingOptionId(null);
    } else {
      setSpeakingOptionId(option.id);
      speak(text);
    }
  }

  const questionImageUrls = useMemo(() => {
    const urls: string[] = [];
    if (activeQuestion?.question_image_url) urls.push(activeQuestion.question_image_url);
    activeQuestion?.options.forEach((o) => { if (o.image_url) urls.push(o.image_url); });
    return urls;
  }, [activeQuestion]);

  useEffect(() => {
    if (questionImageUrls.length === 0) return;
    questionImageUrls.forEach((url) => {
      if (loadedUrls.has(url)) return;
      const img = new window.Image();
      img.onload = () => setLoadedUrls((prev) => new Set(prev).add(url));
      img.src = url;
      if (img.complete) setLoadedUrls((prev) => new Set(prev).add(url));
    });
  }, [questionImageUrls]);

  const allImagesReady = questionImageUrls.every((url) => loadedUrls.has(url));
  const hasImageOptions = activeQuestion?.options.some((o) => o.image_url) ?? false;
  const optionCount = activeQuestion?.options.length ?? 0;
  const optionsGridClass = hasImageOptions
    ? optionCount === 2
      ? "grid grid-cols-2 gap-3"
      : "grid grid-cols-1 gap-3"
    : "space-y-3";

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
            <div className="flex items-center gap-3">
              {isReadingComprehension && !hideTextDuringQuestions && (
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-sm font-medium hover:bg-primary/20 active:scale-95 transition-all"
                      aria-label="Ver texto de lectura"
                    >
                      <BookOpen className="h-4 w-4" />
                      Ver texto
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full sm:max-w-md flex flex-col p-0"
                    style={{ background: "#ffffff", color: "#1a1a1a" }}
                  >
                    <SheetHeader className="flex-shrink-0 px-6 py-4 border-b border-neutral-100">
                      <SheetTitle style={{ color: "#1a1a1a" }}>Texto de lectura</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 sm:px-10 sm:py-8">
                      <div className="max-w-[540px] mx-auto space-y-4">
                        {readingText.split(/\n+/).filter((p) => p.trim()).map((paragraph, idx) => (
                          <p
                            key={idx}
                            className="text-[19px] sm:text-[22px] leading-[1.85] tracking-[0.01em]"
                            style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 300, color: "#374151" }}
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
              <span className="text-sm text-muted-foreground">
                {activeIndex + 1} / {activeTotal}
              </span>
            </div>
          </div>

          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={activeProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                "bg-primary"
              )}
              style={{ width: `${activeProgress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 p-2 sm:p-4">
        <div ref={audioContainerRef} className="max-w-lg mx-auto space-y-5">
          {worldConfig ? (
            <div className="flex items-center gap-2">
              <Image
                key={`char-${activeIndex}`}
                src={worldConfig.characterImage}
                alt="personaje"
                width={208}
                height={208}
                className="shrink-0 w-44 h-44 sm:w-52 sm:h-52 object-contain drop-shadow-xl animate-in slide-in-from-left-6 fade-in duration-500"
              />
              <div
                key={activeIndex}
                className="relative flex-1 rounded-2xl rounded-bl-sm p-4 sm:p-5 animate-in fade-in slide-in-from-left-4 duration-500 bg-white dark:bg-stone-800"
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}
              >
                <div
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-b-[8px] border-r-[10px] border-t-transparent border-b-transparent border-r-white dark:border-r-stone-800"
                />
                <p className="text-sm sm:text-base font-normal text-gray-900 dark:text-stone-100 leading-snug">
                  {activeQuestion?.text}
                </p>
                {activeQuestion?.description && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-stone-400 mt-1.5 leading-relaxed font-light">
                    {activeQuestion.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg sm:text-xl font-normal">{activeQuestion?.text}</h2>
              {activeQuestion?.description && (
                <p className="text-muted-foreground font-light">{activeQuestion.description}</p>
              )}
            </>
          )}

          {activeQuestion?.question_audio_url && (
            <div className="flex justify-center">
              <AudioPlayer src={activeQuestion.question_audio_url} />
            </div>
          )}

          {activeQuestion?.question_image_url && (
            <Image
              src={activeQuestion.question_image_url}
              alt="Imagen de la pregunta"
              width={400}
              height={200}
              className="w-full max-h-[120px] rounded-lg object-contain"
            />
          )}

          {!allImagesReady ? (
            <div className={optionsGridClass}>
              {activeQuestion?.options.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-full rounded-2xl bg-muted animate-pulse",
                    hasImageOptions ? "aspect-square" : "h-14"
                  )}
                  style={{ animationDelay: `${index * 80}ms` }}
                />
              ))}
            </div>
          ) : (
            <div className={optionsGridClass}>
              {activeQuestion?.options.map((option, index) => {
                const isSelected = selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      if (isPending) return;
                      onOptionClick(option.id);
                    }}
                    style={{ animationDelay: `${index * 80}ms` }}
                    className={cn(
                      "relative w-full text-left rounded-2xl border-2 transition-all duration-150 text-sm sm:text-base bg-white dark:bg-stone-800 text-gray-900 dark:text-stone-100 font-normal overflow-hidden",
                      "animate-in slide-in-from-right-4 fade-in duration-300 fill-mode-backwards",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      !isSelected && !isPending && "border-gray-200 dark:border-stone-700 hover:border-blue-300 hover:bg-blue-100 dark:hover:border-blue-500 dark:hover:bg-blue-900 active:scale-[0.98]",
                      isSelected && "border-blue-500 bg-blue-50 dark:bg-blue-900/40",
                      isPending && "cursor-default",
                      !option.image_url && "p-4 min-h-14"
                    )}
                  >
                    {option.image_url ? (
                      <>
                        <div className="relative aspect-square">
                          <Image
                            src={option.image_url}
                            alt={option.audio_label || option.text || `Opción ${index + 1}`}
                            fill
                            className="object-contain p-4"
                          />
                        </div>
                        <span
                          className={cn(
                            "absolute top-2 left-2 flex items-center justify-center h-7 w-7 rounded-xl border-2 text-xs font-bold transition-colors",
                            !isSelected && "border-gray-200 dark:border-stone-600 text-gray-400 dark:text-stone-500 bg-white/80 dark:bg-stone-800/80",
                            isSelected && "border-blue-500 bg-blue-500 text-white"
                          )}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        {isSupported && (
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => handleAudioClick(e, option, index)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleAudioClick(e as unknown as React.MouseEvent, option, index); }}
                            className="absolute bottom-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 dark:border-stone-600 text-gray-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 transition-colors cursor-pointer"
                            aria-label={`Escuchar opción ${index + 1}`}
                          >
                            {speakingOptionId === option.id && isSpeaking ? (
                              <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 0.7 }}
                                className="flex items-center justify-center"
                              >
                                <VolumeX className="h-4 w-4" />
                              </motion.span>
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex shrink-0 items-center justify-center h-8 w-8 rounded-xl border-2 text-xs font-bold transition-colors",
                            !isSelected && "border-gray-200 dark:border-stone-600 text-gray-400 dark:text-stone-500",
                            isSelected && "border-blue-500 bg-blue-500 text-white"
                          )}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1">{option.text}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {isPending && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 text-white text-sm px-4 py-2 rounded-full pointer-events-none">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verificando...
        </div>
      )}
    </div>
  );
}
