"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AudioPlayer } from "@/components/ui/audio-player";
import { ArrowLeft, BookOpen, BarChart3, ChevronRight } from "lucide-react";
import type { WorldConfig } from "@/lib/worlds";
import type { Question } from "./exercise-player";
import { motion } from "framer-motion";

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

function useTypewriter(text: string, speed = 28, startDelay = 1050) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const delay = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(delay);
  }, [text, speed, startDelay, key]);

  const replay = () => setKey((k) => k + 1);
  return { displayed, done, replay };
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
  const accentColor = worldConfig?.accentColor ?? "#C73341";
  const accentFg = worldConfig?.accentFg ?? "#ffffff";

  const diffLabel =
    idlScore !== null && (isReadingComprehension || isTimedReading)
      ? getIdlLabel(idlScore)
      : difficultyLabels[exercise.difficultyLevel];

  const countLabel = isTimedReading
    ? `${wordCount} palabra${wordCount !== 1 ? "s" : ""}`
    : `${questions.length} pregunta${questions.length !== 1 ? "s" : ""}`;

  const { displayed, done, replay } = useTypewriter(exercise.instructions);

  return (
    <div className="h-dvh flex flex-col bg-white overflow-hidden">
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      {/* ── MOBILE layout (hidden lg+) ── */}
      <div className="flex flex-col h-full lg:hidden">
        <header className="shrink-0 flex items-center justify-between px-4 pt-4 pb-0">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Volver
          </Link>
          {worldConfig && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-neutral-100 text-neutral-500 text-[11px] rounded-full px-3 py-1">
                <BookOpen className="h-3 w-3" />
                {diffLabel}
              </span>
              <span className="flex items-center gap-1.5 bg-neutral-100 text-neutral-500 text-[11px] rounded-full px-3 py-1">
                <BarChart3 className="h-3 w-3" />
                {countLabel}
              </span>
            </div>
          )}
        </header>

        {worldConfig ? (
          <main className="flex-1 flex flex-col min-h-0 px-4 pt-3">
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, ease: "easeOut", delay: 0.75 }}
              className="mb-2"
            >
              <div
                className="bg-white rounded-2xl rounded-bl-[3px] p-3.5 border border-neutral-100"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                  style={{ color: accentColor }}
                >
                  {exercise.typeDisplayName}
                </p>
                <p className="text-[13px] text-neutral-500 leading-relaxed min-h-9.5">
                  {displayed}
                  {!done && (
                    <span
                      className="inline-block w-0.5 h-3.25 ml-px align-middle"
                      style={{ background: accentColor, animation: "blink 0.7s step-end infinite" }}
                    />
                  )}
                </p>
                {exercise.instructionsAudioUrl && done && (
                  <div className="mt-2">
                    <AudioPlayer src={exercise.instructionsAudioUrl} />
                  </div>
                )}
              </div>
            </motion.div>

            <div className="flex-1 flex flex-col items-center justify-end min-h-0">
              <motion.div
                initial={{ scale: 0.7, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1], delay: 0.08 }}
                className="flex items-end justify-center"
                style={{ flex: 1, minHeight: 0 }}
              >
                <Image
                  src={worldConfig.characterImage}
                  alt=""
                  width={480}
                  height={480}
                  className="w-full max-w-75 sm:max-w-90 h-auto object-contain object-bottom"
                  style={{ maxHeight: "100%" }}
                />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, ease: "easeOut", delay: 0.52 }}
                className="text-[22px] font-bold text-neutral-900 text-center tracking-tight pb-2"
                style={{ fontFamily: "var(--font-lexend)" }}
              >
                {exercise.title}
              </motion.h1>
            </div>
          </main>
        ) : (
          <main className="flex-1 flex flex-col min-h-0 px-4 pt-6 gap-3">
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 }}
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: accentColor }}
            >
              {exercise.typeDisplayName}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.28 }}
              className="text-[28px] font-bold text-neutral-900 tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-lexend)" }}
            >
              {exercise.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.38 }}
              className="text-[14px] text-neutral-500 leading-relaxed"
            >
              {exercise.instructions}
            </motion.p>
            {exercise.instructionsAudioUrl && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.46 }}
              >
                <AudioPlayer src={exercise.instructionsAudioUrl} />
              </motion.div>
            )}
          </main>
        )}

        <footer className="shrink-0 px-4 pb-5 pt-2">
          <button
            type="button"
            onClick={() => { replay(); onStart(); }}
            className="w-full rounded-2xl py-4 text-[15px] font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: accentColor, color: accentFg }}
          >
            Comenzar
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </footer>
      </div>

      {/* ── DESKTOP layout — con personaje (hidden below lg) ── */}
      {worldConfig && (
        <div className="hidden lg:flex flex-col h-full">
          <header className="shrink-0 grid grid-cols-3 items-center px-10 py-5 border-b border-neutral-100">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-[15px] text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2} />
              Volver
            </Link>
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 }}
              className="text-[13px] font-semibold uppercase tracking-[0.14em] text-center"
              style={{ color: accentColor }}
            >
              {exercise.typeDisplayName}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.25 }}
              className="flex items-center gap-2 justify-end"
            >
              <span className="flex items-center gap-2 bg-neutral-100 text-neutral-600 text-[14px] rounded-full px-4 py-2">
                <BookOpen className="h-4 w-4" />
                {diffLabel}
              </span>
              <span className="flex items-center gap-2 bg-neutral-100 text-neutral-600 text-[14px] rounded-full px-4 py-2">
                <BarChart3 className="h-4 w-4" />
                {countLabel}
              </span>
            </motion.div>
          </header>

          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
              className="relative min-h-0 w-full"
              style={{ flex: "1 1 0" }}
            >
              <Image
                src={worldConfig.characterImage}
                alt=""
                fill
                priority
                className="object-contain object-bottom"
              />
            </motion.div>

            <div className="shrink-0 flex flex-col items-center gap-2 text-center px-8 pt-4 pb-10">
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.3 }}
                className="font-bold text-neutral-900 leading-tight tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-lexend)", fontSize: "clamp(32px, 2.8vw, 52px)" }}
              >
                {exercise.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.38 }}
                className="text-neutral-600 leading-snug max-w-xl"
                style={{ fontSize: "clamp(15px, 1.1vw, 19px)" }}
              >
                {exercise.instructions}
              </motion.p>
              {exercise.instructionsAudioUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.44 }}
                  className="mt-1"
                >
                  <AudioPlayer src={exercise.instructionsAudioUrl} />
                </motion.div>
              )}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.5 }}
                type="button"
                onClick={onStart}
                className="mt-3 rounded-2xl px-10 py-3.5 text-[15px] font-semibold inline-flex items-center gap-2 transition-opacity hover:opacity-90 cursor-pointer"
                style={{
                  backgroundColor: accentColor,
                  color: accentFg,
                  boxShadow: `0 12px 28px -10px ${accentColor}8c`,
                }}
              >
                Comenzar
                <ChevronRight className="h-5 w-5" strokeWidth={2} />
              </motion.button>
            </div>
          </main>
        </div>
      )}

      {/* ── DESKTOP layout — sin personaje (hidden below lg) ── */}
      {!worldConfig && (
        <div className="hidden lg:flex flex-col h-full">
          <header className="shrink-0 flex items-center px-8 py-4 border-b border-neutral-100">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              Volver
            </Link>
          </header>

          <main className="flex-1 flex items-center justify-center py-16">
            <div className="w-full max-w-xl px-8 flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <motion.p
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
                  className="text-[11px] font-semibold uppercase tracking-[0.09em]"
                  style={{ color: accentColor }}
                >
                  {exercise.typeDisplayName}
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: 0.28 }}
                  className="text-[48px] font-bold text-neutral-900 leading-none tracking-[-1px]"
                  style={{ fontFamily: "var(--font-lexend)" }}
                >
                  {exercise.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: 0.36 }}
                  className="text-[18px] text-neutral-500 leading-relaxed"
                >
                  {exercise.instructions}
                </motion.p>
              </div>

              <div className="flex flex-col gap-4">
                {exercise.instructionsAudioUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut", delay: 0.42 }}
                  >
                    <AudioPlayer src={exercise.instructionsAudioUrl} />
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: 0.48 }}
                >
                  <button
                    type="button"
                    onClick={onStart}
                    className="self-start rounded-xl px-8 py-3.5 text-[15px] font-semibold flex items-center gap-2 transition-opacity hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: accentColor, color: accentFg }}
                  >
                    Comenzar
                    <ChevronRight className="h-5 w-5" strokeWidth={2} />
                  </button>
                </motion.div>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}