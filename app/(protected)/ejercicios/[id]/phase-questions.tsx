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
import { AnimatePresence, motion } from "framer-motion";
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

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

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
  const { speakSpelled, stop, isSpeaking, isSupported } = useSpeech();
  const isDesktop = useIsDesktop();

  function handleAudioClick(e: React.MouseEvent, option: Option, index: number) {
    e.stopPropagation();
    const text = option.audio_label || `Opción ${index + 1}`;
    if (speakingOptionId === option.id && isSpeaking) {
      stop();
      setSpeakingOptionId(null);
    } else {
      setSpeakingOptionId(option.id);
      speakSpelled(text);
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
  const hasQuestionImage = Boolean(activeQuestion?.question_image_url);
  const optionsGridClass = hasImageOptions ? "grid grid-cols-2 gap-2 sm:gap-3" : "flex flex-col gap-2";

  const sheetContent = (
    <SheetContent
      side="right"
      className="w-full sm:max-w-md flex flex-col p-0"
      style={{ background: "#ffffff", color: "#1a1a1a" }}
    >
      <SheetHeader className="shrink-0 px-6 py-4 border-b border-neutral-100">
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
  );

  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      {/* Header — condicional por JS igual que el layout */}
      <header className="shrink-0 bg-background/95 backdrop-blur-sm border-b border-neutral-100">
        {isDesktop ? (
          <div style={{ display: "grid", gridTemplateColumns: "30% 1fr", minHeight: 60 }}>
            {/* Columna izquierda — alineada con panel del personaje */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid #f0f0f0" }}>
              <Link
                href={backHref}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Salir del ejercicio"
              >
                <XCircle className="h-5 w-5" />
              </Link>
            </div>

            {/* Columna derecha — segmentos + contador + ver texto */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "0 32px" }}>
              {/* Segmentos de progreso */}
              <div
                style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}
                role="progressbar"
                aria-valuenow={activeProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {Array.from({ length: activeTotal }).map((_, i) => (
                  <motion.div
                    key={i}
                    style={{ flex: 1, height: 7, borderRadius: 999 }}
                    initial={false}
                    animate={{
                      backgroundColor:
                        i < activeIndex
                          ? "var(--primary)"
                          : i === activeIndex
                          ? "color-mix(in srgb, var(--primary) 35%, transparent)"
                          : "var(--muted)",
                    }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                ))}
              </div>

              {/* Contador */}
              <span style={{ flexShrink: 0, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", color: "var(--foreground)", opacity: 0.7 }}>
                {activeIndex + 1}
                <span style={{ fontWeight: 400, opacity: 0.5 }}> / {activeTotal}</span>
              </span>

              {/* Ver texto */}
              {isReadingComprehension && !hideTextDuringQuestions && (
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="shrink-0 flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-sm font-medium hover:bg-primary/20 active:scale-95 transition-all"
                      aria-label="Ver texto de lectura"
                    >
                      <BookOpen className="h-4 w-4" />
                      Ver texto
                    </button>
                  </SheetTrigger>
                  {sheetContent}
                </Sheet>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-4 pt-3 pb-2 space-y-2">
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
                    {sheetContent}
                  </Sheet>
                )}
                <span className="text-sm font-medium tabular-nums text-muted-foreground">
                  {activeIndex + 1} / {activeTotal}
                </span>
              </div>
            </div>
            <div
              className="h-1.5 rounded-full bg-muted overflow-hidden"
              role="progressbar"
              aria-valuenow={activeProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{ width: `${activeProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 min-h-0 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
          >
            {hasQuestionImage ? (
              <ImageQuestionLayout
                audioContainerRef={audioContainerRef}
                activeQuestion={activeQuestion}
                allImagesReady={allImagesReady}
                hasImageOptions={hasImageOptions}
                optionsGridClass={optionsGridClass}
                selectedOptionId={selectedOptionId}
                isPending={isPending}
                isSpeaking={isSpeaking}
                speakingOptionId={speakingOptionId}
                isSupported={isSupported}
                onOptionClick={onOptionClick}
                onAudioClick={handleAudioClick}
              />
            ) : (
              <CharacterQuestionLayout
                audioContainerRef={audioContainerRef}
                activeQuestion={activeQuestion}
                worldConfig={worldConfig}
                allImagesReady={allImagesReady}
                hasImageOptions={hasImageOptions}
                optionsGridClass={optionsGridClass}
                selectedOptionId={selectedOptionId}
                isPending={isPending}
                isSpeaking={isSpeaking}
                speakingOptionId={speakingOptionId}
                isSupported={isSupported}
                onOptionClick={onOptionClick}
                onAudioClick={handleAudioClick}
                isDesktop={isDesktop}
              />
            )}
          </motion.div>
        </AnimatePresence>
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

type LayoutProps = {
  audioContainerRef: RefObject<HTMLDivElement | null>;
  activeQuestion: Question | null;
  worldConfig?: WorldConfig | null;
  allImagesReady: boolean;
  hasImageOptions: boolean;
  optionsGridClass: string;
  selectedOptionId: string | null;
  isPending: boolean;
  isSpeaking: boolean;
  speakingOptionId: string | null;
  isSupported: boolean;
  onOptionClick: (id: string) => void;
  onAudioClick: (e: React.MouseEvent, option: Option, index: number) => void;
  isDesktop?: boolean;
};

function ImageQuestionLayout({
  audioContainerRef,
  activeQuestion,
  allImagesReady,
  hasImageOptions,
  optionsGridClass,
  selectedOptionId,
  isPending,
  isSpeaking,
  speakingOptionId,
  isSupported,
  onOptionClick,
  onAudioClick,
}: LayoutProps) {
  return (
    <div
      ref={audioContainerRef}
      className="flex-1 min-h-0 flex flex-col max-w-sm sm:max-w-md lg:max-w-xl mx-auto w-full px-4 sm:px-6 py-3 gap-3"
    >
      <div className="shrink-0 rounded-xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-white/60 dark:border-stone-700/60 px-4 py-3 shadow-sm">
        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-stone-100 leading-snug">
          {activeQuestion?.text}
        </p>
        {activeQuestion?.description && (
          <p className="text-xs text-gray-500 dark:text-stone-400 mt-1 leading-relaxed font-light">
            {activeQuestion.description}
          </p>
        )}
      </div>

      {activeQuestion?.question_image_url && (
        <div
          className="shrink-0 rounded-xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-white/60 dark:border-stone-700/60 shadow-sm overflow-hidden"
          style={{ height: "clamp(100px, 28vh, 220px)" }}
        >
          <div className="relative w-full h-full">
            <Image
              src={activeQuestion.question_image_url}
              alt="Imagen de la pregunta"
              fill
              className="object-contain p-4"
              priority
            />
          </div>
        </div>
      )}

      {activeQuestion?.question_audio_url && (
        <div className="shrink-0 flex justify-center">
          <AudioPlayer src={activeQuestion.question_audio_url} />
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col">
        {!allImagesReady ? (
          <div className={cn(optionsGridClass, "flex-1")}>
            {activeQuestion?.options.map((_, index) => (
              <div
                key={index}
                className="w-full rounded-2xl bg-muted animate-pulse h-full"
                style={{ animationDelay: `${index * 80}ms` }}
              />
            ))}
          </div>
        ) : (
          <div className={cn(optionsGridClass, hasImageOptions && "flex-1")}>
            {activeQuestion?.options.map((option, index) => (
              <OptionButton
                key={option.id ?? String(index)}
                option={option}
                index={index}
                isSelected={selectedOptionId === option.id}
                isPending={isPending}
                isSpeaking={isSpeaking}
                speakingOptionId={speakingOptionId}
                isSupported={isSupported}
                onOptionClick={onOptionClick}
                onAudioClick={onAudioClick}
                fillHeight={hasImageOptions}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CharacterQuestionLayout({
  audioContainerRef,
  activeQuestion,
  worldConfig,
  allImagesReady,
  hasImageOptions,
  optionsGridClass,
  selectedOptionId,
  isPending,
  isSpeaking,
  speakingOptionId,
  isSupported,
  onOptionClick,
  onAudioClick,
  isDesktop,
}: LayoutProps) {
  const options = !allImagesReady ? (
    <div className={optionsGridClass}>
      {activeQuestion?.options.map((_, index) => (
        <div
          key={index}
          className={cn("w-full rounded-2xl bg-muted animate-pulse", hasImageOptions ? "aspect-[4/3]" : "h-14")}
          style={{ animationDelay: `${index * 80}ms` }}
        />
      ))}
    </div>
  ) : (
    <div className={optionsGridClass}>
      {activeQuestion?.options.map((option, index) => (
        <OptionButton
          key={option.id ?? String(index)}
          option={option}
          index={index}
          isSelected={selectedOptionId === option.id}
          isPending={isPending}
          isSpeaking={isSpeaking}
          speakingOptionId={speakingOptionId}
          isSupported={isSupported}
          onOptionClick={onOptionClick}
          onAudioClick={onAudioClick}
        />
      ))}
    </div>
  );

  if (isDesktop) {
    return (
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden", alignItems: "stretch" }}>
        {/* Panel izquierdo — personaje + bocadillo */}
        <div
          style={{
            width: "30%",
            flexShrink: 0,
            borderRight: "1px solid #f0f0f0",
            background: "rgba(250,250,250,0.6)",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: 0,
          }}
        >
          {/* Bocadillo de diálogo */}
          {activeQuestion?.text && (
            <motion.div
              key={activeQuestion.text}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: 24,
                left: 16,
                right: 16,
                background: "#ffffff",
                borderRadius: 16,
                padding: "14px 18px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid #f0f0f0",
              }}
            >
              {/* Triángulo apuntando abajo hacia el personaje */}
              <div style={{
                position: "absolute",
                bottom: -10,
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "10px solid #ffffff",
                filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.06))",
              }} />
              <p style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#1f2937",
                lineHeight: 1.5,
                margin: 0,
                textAlign: "center",
              }}>
                {activeQuestion.text}
              </p>
              {activeQuestion.description && (
                <p style={{
                  fontSize: 12,
                  color: "#9ca3af",
                  marginTop: 6,
                  lineHeight: 1.4,
                  textAlign: "center",
                }}>
                  {activeQuestion.description}
                </p>
              )}
              {activeQuestion.question_audio_url && (
                <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
                  <AudioPlayer src={activeQuestion.question_audio_url} />
                </div>
              )}
            </motion.div>
          )}

          {/* Personaje */}
          {worldConfig && (
            <img
              src={worldConfig.characterImage}
              alt="personaje"
              style={{
                width: "85%",
                height: "55%",
                objectFit: "contain",
                objectPosition: "center bottom",
                flexShrink: 0,
              }}
            />
          )}
        </div>

        {/* Panel derecho — solo opciones */}
        <div
          ref={audioContainerRef}
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 16,
            padding: "48px 56px",
            overflowY: "auto",
          }}
        >
          {options}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col max-w-lg mx-auto w-full px-4 py-6 gap-6">
      <div className="shrink-0 flex flex-col items-center gap-4">
        {worldConfig ? (
          <>
            <div className="relative w-36 h-36 sm:w-44 sm:h-44">
              <Image
                src={worldConfig.characterImage}
                alt="personaje"
                fill
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>
            <div
              className="relative w-full rounded-2xl rounded-tl-sm px-5 py-4 bg-white dark:bg-stone-800"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.09)" }}
            >
              <div className="absolute -top-2 left-10 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-l-transparent border-r-transparent border-b-white dark:border-b-stone-800" />
              <p className="text-base sm:text-lg font-normal text-gray-900 dark:text-stone-100 leading-snug text-center">
                {activeQuestion?.text}
              </p>
              {activeQuestion?.description && (
                <p className="text-sm text-gray-500 dark:text-stone-400 mt-2 leading-relaxed font-light text-center">
                  {activeQuestion.description}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-xl font-normal">{activeQuestion?.text}</h2>
            {activeQuestion?.description && (
              <p className="text-muted-foreground font-light text-sm">{activeQuestion.description}</p>
            )}
          </div>
        )}
        {activeQuestion?.question_audio_url && (
          <div className="flex justify-center">
            <AudioPlayer src={activeQuestion.question_audio_url} />
          </div>
        )}
      </div>

      <div ref={audioContainerRef} className="flex-1 min-h-0 flex flex-col justify-center">
        {options}
      </div>
    </div>
  );
}

function OptionButton({
  option,
  index,
  isSelected,
  isPending,
  isSpeaking,
  speakingOptionId,
  isSupported,
  onOptionClick,
  onAudioClick,
  fillHeight = false,
}: {
  option: Option;
  index: number;
  isSelected: boolean;
  isPending: boolean;
  isSpeaking: boolean;
  speakingOptionId: string | null;
  isSupported: boolean;
  onOptionClick: (id: string) => void;
  onAudioClick: (e: React.MouseEvent, option: Option, index: number) => void;
  fillHeight?: boolean;
}) {
  return (
    <motion.button
      type="button"
      disabled={isPending}
      onClick={() => { if (!isPending) onOptionClick(option.id); }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: "easeOut" }}
      className={cn(
        "relative w-full text-left rounded-2xl border-2 transition-all duration-150 text-sm bg-white dark:bg-stone-800 text-gray-900 dark:text-stone-100 font-normal overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        !isSelected && !isPending && "border-gray-200 dark:border-stone-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-500 dark:hover:bg-blue-900 active:scale-[0.98]",
        isSelected && "border-blue-500 bg-blue-50 dark:bg-blue-900/40",
        isPending && "cursor-default",
        !option.image_url && "p-3 min-h-12",
        fillHeight && "h-full"
      )}
    >
      {option.image_url ? (
        <ImageOption
          option={option}
          index={index}
          isSelected={isSelected}
          isSpeaking={isSpeaking}
          speakingOptionId={speakingOptionId}
          isSupported={isSupported}
          onAudioClick={onAudioClick}
          fillHeight={fillHeight}
        />
      ) : (
        <TextOption option={option} index={index} isSelected={isSelected} />
      )}
    </motion.button>
  );
}

function ImageOption({
  option,
  index,
  isSelected,
  isSpeaking,
  speakingOptionId,
  isSupported,
  onAudioClick,
  fillHeight = false,
}: {
  option: Option;
  index: number;
  isSelected: boolean;
  isSpeaking: boolean;
  speakingOptionId: string | null;
  isSupported: boolean;
  onAudioClick: (e: React.MouseEvent, option: Option, index: number) => void;
  fillHeight?: boolean;
}) {
  return (
    <>
      <div className={cn("relative bg-white/60 dark:bg-stone-900/60", fillHeight ? "h-full" : "aspect-[4/3]")}>
        <Image
          src={option.image_url!}
          alt={option.audio_label || option.text || `Opción ${index + 1}`}
          fill
          className="object-contain p-2"
        />
      </div>
      <span
        className={cn(
          "absolute top-2 left-2 flex items-center justify-center h-6 w-6 rounded-lg border-2 text-xs font-bold transition-colors",
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
          onClick={(e) => onAudioClick(e, option, index)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onAudioClick(e as unknown as React.MouseEvent, option, index);
          }}
          className="absolute bottom-2 right-2 flex items-center justify-center w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 dark:border-stone-600 text-gray-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 transition-colors cursor-pointer"
          aria-label={`Escuchar opción ${index + 1}`}
        >
          {speakingOptionId === option.id && isSpeaking ? (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.7 }}
              className="flex items-center justify-center"
            >
              <VolumeX className="h-3.5 w-3.5" />
            </motion.span>
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
        </div>
      )}
    </>
  );
}

function TextOption({
  option,
  index,
  isSelected,
}: {
  option: Option;
  index: number;
  isSelected: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "flex shrink-0 items-center justify-center h-7 w-7 rounded-xl border-2 text-xs font-bold transition-colors",
          !isSelected && "border-gray-200 dark:border-stone-600 text-gray-400 dark:text-stone-500",
          isSelected && "border-blue-500 bg-blue-500 text-white"
        )}
      >
        {String.fromCharCode(65 + index)}
      </span>
      <span className="flex-1">{option.text}</span>
    </div>
  );
}