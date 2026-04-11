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
  const accentColor = worldConfig?.accentColor ?? "#E07820";
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
        </header>

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
              <p className="text-[13px] text-neutral-500 leading-relaxed min-h-[38px]">
                {displayed}
                {!done && (
                  <span
                    className="inline-block w-[2px] h-[13px] ml-[1px] align-middle"
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
            {worldConfig && (
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
            )}
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

      {/* ── DESKTOP layout (hidden below lg) ── */}
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

        <main className="flex-1 flex min-h-0">
          {/* Columna personaje — 50% y sin límite de ancho para que llene */}
          <div className="w-1/2 flex items-end justify-center overflow-hidden">
            {worldConfig && (
              <motion.div
                initial={{ x: -40, opacity: 0, scale: 0.92 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
                className="flex items-end justify-center w-full h-full"
              >
                <Image
                  src={worldConfig.characterImage}
                  alt=""
                  width={720}
                  height={720}
                  className="w-full h-full object-contain object-bottom scale-110"
                />
              </motion.div>
            )}
          </div>

          {/* Columna contenido */}
          <div className="w-1/2 flex flex-col justify-center pr-20 pl-8 py-12 gap-8">
            <div className="flex flex-col gap-3">
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.25 }}
                className="text-[11px] font-semibold uppercase tracking-[0.09em]"
                style={{ color: accentColor }}
              >
                {exercise.typeDisplayName}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.3 }}
                className="text-[54px] font-bold text-neutral-900 leading-none tracking-[-1px]"
                style={{ fontFamily: "var(--font-lexend)" }}
              >
                {exercise.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.4 }}
                className="text-[20px] text-neutral-500 leading-relaxed max-w-95"
              >
                {exercise.instructions}
              </motion.p>
            </div>

            <div className="flex flex-col gap-4">
              {exercise.instructionsAudioUrl && (
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: 0.45 }}
                >
                  <AudioPlayer src={exercise.instructionsAudioUrl} />
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.5 }}
                className="inline-flex flex-col gap-4"
              >
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${accentColor}18` }}
                    >
                      <BookOpen className="h-5 w-5" style={{ color: accentColor }} />
                    </div>
                    <div>
                      <p className="text-[11px] text-neutral-400 leading-tight">Dificultad</p>
                      <p className="text-[15px] font-semibold text-neutral-800">{diffLabel}</p>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-neutral-100" />
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${accentColor}18` }}
                    >
                      <BarChart3 className="h-5 w-5" style={{ color: accentColor }} />
                    </div>
                    <div>
                      <p className="text-[11px] text-neutral-400 leading-tight">
                        {isTimedReading ? "Palabras" : "Preguntas"}
                      </p>
                      <p className="text-[15px] font-semibold text-neutral-800">{countLabel}</p>
                    </div>
                  </div>
                </div>

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
    </div>
  );
}