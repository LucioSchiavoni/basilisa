"use client";

import { type RefObject } from "react";
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
import { BookOpen, Loader2, XCircle } from "lucide-react";
import type { WorldConfig } from "@/lib/worlds";
import type { Question } from "./exercise-player";

type Props = {
  worldBg: React.ReactNode;
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
  worldBg,
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
  return (
    <div className="min-h-screen flex flex-col">
      {worldBg}
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
                  <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
                    <SheetHeader>
                      <SheetTitle>Texto de lectura</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4">
                      <div className="bg-white text-gray-900 rounded-2xl p-6 shadow-lg">
                        <p className="text-lg leading-loose tracking-wide font-light whitespace-pre-wrap">
                          {readingText}
                        </p>
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

      <main className="flex-1 p-4 sm:p-6">
        <div ref={audioContainerRef} className="max-w-lg mx-auto space-y-5">
          {worldConfig ? (
            <div className="flex items-start gap-3">
              <div
                key={`char-${activeIndex}`}
                className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 animate-in slide-in-from-left-6 fade-in duration-500"
              >
                <Image
                  src={worldConfig.characterImage}
                  alt="personaje"
                  fill
                  className="object-contain drop-shadow-xl"
                  sizes="(min-width: 640px) 96px, 80px"
                />
              </div>
              <div
                key={activeIndex}
                className="relative flex-1 rounded-2xl rounded-bl-sm p-4 sm:p-5 animate-in fade-in slide-in-from-left-4 duration-500"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
                }}
              >
                <div
                  className="absolute -left-2 bottom-4 w-0 h-0"
                  style={{
                    borderTop: "8px solid transparent",
                    borderBottom: "8px solid transparent",
                    borderRight: "10px solid rgba(255,255,255,0.95)",
                  }}
                />
                <p className="text-sm sm:text-base font-normal text-gray-900 leading-snug">
                  {activeQuestion?.text}
                </p>
                {activeQuestion?.description && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed font-light">
                    {activeQuestion.description}
                  </p>
                )}
                {activeQuestion?.question_audio_url && (
                  <div className="mt-3">
                    <AudioPlayer src={activeQuestion.question_audio_url} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg sm:text-xl font-normal">{activeQuestion?.text}</h2>
              {activeQuestion?.description && (
                <p className="text-muted-foreground font-light">{activeQuestion.description}</p>
              )}
              {activeQuestion?.question_audio_url && (
                <AudioPlayer src={activeQuestion.question_audio_url} />
              )}
            </>
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

          <div className="space-y-3" role="radiogroup" aria-label="Opciones de respuesta">
            {activeQuestion?.options.map((option, index) => {
              const isSelected = selectedOptionId === option.id;
              const variant = isSelected ? "selected" : "default";

              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={isPending}
                  onClick={() => {
                    if (isPending) return;
                    onOptionClick(option.id);
                  }}
                  style={{ animationDelay: `${index * 80}ms` }}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 min-h-[48px] text-sm sm:text-base bg-white text-gray-900 font-light",
                    "animate-in slide-in-from-right-4 fade-in duration-300 fill-mode-backwards",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    variant === "default" &&
                      "border-gray-200 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98]",
                    variant === "selected" && "border-blue-500 bg-blue-50",
                    isPending && "cursor-default"
                  )}
                >
                  <div className={cn("flex items-center gap-3", option.image_url && "flex-row")}>
                    <span
                      className={cn(
                        "flex shrink-0 items-center justify-center h-6 w-6 rounded-full border-2 text-xs font-bold transition-colors",
                        variant === "default" && "border-gray-300",
                        variant === "selected" && "border-blue-500 bg-blue-500 text-white",
                      )}
                    />
                    {option.image_url && (
                      <Image
                        src={option.image_url}
                        alt={option.text}
                        width={200}
                        height={80}
                        className="max-h-[80px] w-auto rounded-md object-contain"
                      />
                    )}
                    <span className="flex-1">{option.text}</span>
                  </div>
                </button>
              );
            })}
          </div>
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
