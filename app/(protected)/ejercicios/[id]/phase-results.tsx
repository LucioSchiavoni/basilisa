"use client";

import { useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { fireWinConfetti } from "@/lib/confetti";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { calculatePPM } from "@/lib/constants/reading-speeds";
import { GemCounter } from "./gem-counter";
import type { AnswerResult } from "./actions";
import type { Question } from "./exercise-player";

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function scoreColor(pct: number): string {
  if (pct >= 80) return "#579F93";
  if (pct >= 60) return "#6db3a7";
  if (pct >= 40) return "#facc15";
  return "#fb923c";
}

function getMotivationalMsg(score: number) {
  if (score === 100) return { emoji: "🏆", title: "¡Perfecto!", subtitle: "¡Dominaste este ejercicio!" };
  if (score >= 80) return { emoji: "🌟", title: "¡Muy bien!", subtitle: "Estás avanzando genial" };
  if (score >= 60) return { emoji: "💪", title: "¡Buen trabajo!", subtitle: "Sigue practicando" };
  if (score >= 40) return { emoji: "🌱", title: "¡Vas por buen camino!", subtitle: "Cada intento te hace mejor" };
  return { emoji: "🫶", title: "¡No te rindas!", subtitle: "La práctica hace la diferencia" };
}

function getWpmMsg(wpm: number) {
  if (wpm >= 200) return { emoji: "🚀", title: "¡Velocidad impresionante!", subtitle: "Lectura avanzada" };
  if (wpm >= 150) return { emoji: "🌟", title: "¡Muy buena velocidad!", subtitle: "Sigue así" };
  if (wpm >= 100) return { emoji: "💪", title: "¡Buen ritmo de lectura!", subtitle: "Vas mejorando" };
  if (wpm >= 60) return { emoji: "📖", title: "¡Vas muy bien!", subtitle: "La velocidad mejora con la práctica" };
  return { emoji: "🐢", title: "¡Excelente concentración!", subtitle: "La fluidez llega con la práctica" };
}

function DonutChart({ percentage }: { percentage: number }) {
  const size = 120;
  const strokeWidth = 10;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const color = scoreColor(percentage);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e7e5e4" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (percentage / 100) * circ }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold leading-none tabular-nums" style={{ color }}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}

function TimeCard({
  readingTimeSeconds,
  totalTimeSeconds,
  wordCount,
}: {
  readingTimeSeconds?: number;
  totalTimeSeconds: number;
  wordCount?: number;
}) {
  const cols = [
    readingTimeSeconds !== undefined && { label: "Lectura", value: fmt(readingTimeSeconds) },
    { label: "Total", value: fmt(totalTimeSeconds) },
    wordCount && wordCount > 0 && { label: "Palabras", value: String(wordCount) },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div
      className="rounded-2xl bg-[#faf7f2] dark:bg-stone-800 py-3 divide-x divide-stone-200 dark:divide-stone-700"
      style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}
    >
      {cols.map((col) => (
        <div key={col.label} className="flex flex-col items-center gap-0.5 px-2">
          <span className="text-[9px] font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500 truncate">{col.label}</span>
          <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100 tabular-nums leading-tight">{col.value}</span>
        </div>
      ))}
    </div>
  );
}

function ScoreCountCard({ correct, total }: { correct: number; total: number }) {
  return (
    <div className="flex-1 rounded-2xl bg-[#faf7f2] dark:bg-stone-800 px-4 py-3 flex flex-col items-center justify-center gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">Correctas</span>
      <span className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums leading-none">
        {correct}<span className="text-base font-semibold text-stone-400 dark:text-stone-500">/{total}</span>
      </span>
    </div>
  );
}

function SpeedMeter({ actualPPM, expectedPPM }: { actualPPM: number; expectedPPM: number }) {
  const ratio = expectedPPM > 0 ? Math.min(actualPPM / expectedPPM, 2) : 0;
  const pct = Math.min(ratio * 100, 100);
  const color = ratio >= 1 ? "#579F93" : ratio >= 0.7 ? "#facc15" : "#fb923c";
  const label =
    ratio >= 1.2 ? "¡Excelente velocidad!" :
      ratio >= 1 ? "¡Por encima del nivel esperado!" :
        ratio >= 0.7 ? "Muy cerca del objetivo" :
          "Sigue practicando la fluidez";

  return (
    <div className="rounded-2xl bg-[#faf7f2] dark:bg-stone-800 p-5 space-y-3">
      <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400 dark:text-stone-500">
        Velocidad de lectura
      </span>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-4xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums leading-none">{actualPPM}</span>
        <span className="text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500">palabras por minuto</span>
        <span className="ml-auto text-xs text-stone-400 dark:text-stone-500 shrink-0">Esperado: {expectedPPM} ppm</span>
      </div>
      <div className="relative h-2.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <div
          className="absolute top-[-4px] w-0.5 h-[18px] bg-stone-500 rounded"
          style={{ left: "50%" }}
        />
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

function MiniEvolutionChart({ attempts }: { attempts: { score: number; date: string }[] }) {
  if (!attempts.length) return null;

  if (attempts.length === 1) {
    return (
      <div className="rounded-2xl bg-[#faf7f2] dark:bg-stone-800 p-5 space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">Tu evolución</span>
        <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-3">
          ¡Primera vez! Volvé a intentarlo para ver tu progreso
        </p>
      </div>
    );
  }

  const W = 280;
  const H = 84;
  const pad = { top: 10, right: 12, bottom: 26, left: 12 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const pts = attempts.map((a, i) => ({
    x: pad.left + (i / (attempts.length - 1)) * cw,
    y: pad.top + ch - (a.score / 100) * ch,
    score: a.score,
    date: a.date,
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${pts[pts.length - 1].x.toFixed(1)} ${(pad.top + ch).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(pad.top + ch).toFixed(1)} Z`;
  const delta = attempts[attempts.length - 1].score - attempts[attempts.length - 2].score;

  return (
    <div className="rounded-2xl bg-[#faf7f2] dark:bg-stone-800 p-5 space-y-3">
      <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">Tu evolución</span>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <defs>
          <linearGradient id="evoAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#579F93" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#579F93" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <motion.path
          d={areaD}
          fill="url(#evoAreaGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
        <motion.path
          d={pathD}
          fill="none"
          stroke="#579F93"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        {pts.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={i === pts.length - 1 ? 5 : 3}
              fill={i === pts.length - 1 ? "#457f75" : "#579F93"}
              stroke="white"
              strokeWidth={2}
            />
            <text
              x={p.x}
              y={H - 4}
              textAnchor="middle"
              fontSize={10}
              fill="#a8a29e"
              fontFamily="inherit"
            >
              {p.date}
            </text>
          </g>
        ))}
      </svg>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold" style={{ color: delta >= 0 ? "#579F93" : "#fb923c" }}>
          {delta >= 0 ? "+" : ""}{delta}%
        </span>
        <span className="text-xs text-stone-400 dark:text-stone-500">vs última vez</span>
      </div>
    </div>
  );
}

function QuestionTimeline({
  questions,
  answers,
  maxSeconds = 30,
}: {
  questions: Question[];
  answers: AnswerResult[];
  maxSeconds?: number;
}) {
  const merged = questions.flatMap((q) => {
    const a = answers.find((ans) => ans.questionId === q.id);
    if (!a) return [];
    return [{
      num: questions.indexOf(q) + 1,
      correct: a.isCorrect,
      timeSeconds: a.timeSpentSeconds,
      selectedText: q.options.find((o) => o.id === a.selectedOptionId)?.text ?? "—",
      correctText: q.options.find((o) => o.id === a.correctOptionId)?.text ?? "—",
    }];
  });

  if (!merged.length) return null;

  const maxT = Math.max(...merged.map((m) => m.timeSeconds), maxSeconds);
  const correctCount = merged.filter((m) => m.correct).length;
  const avgTime = merged.reduce((s, m) => s + m.timeSeconds, 0) / merged.length;
  const slowestIdx = merged.reduce((mi, m, i, arr) => m.timeSeconds > arr[mi].timeSeconds ? i : mi, 0);

  return (
    <div className="rounded-2xl bg-[#faf7f2] dark:bg-stone-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400 dark:text-stone-500">Detalle por pregunta</span>
        <span className="text-sm font-bold text-stone-900 dark:text-stone-100 tabular-nums">{correctCount}/{merged.length}</span>
      </div>
      <div className="space-y-2">
        {merged.map((item, i) => (
          <div key={item.num} className="flex items-center gap-2">
            <span className="w-5 text-xs font-semibold text-stone-400 dark:text-stone-500 text-right shrink-0">{item.num}</span>
            <div className="flex-1 h-5 bg-stone-200 dark:bg-stone-700 rounded-md overflow-hidden relative">
              <motion.div
                className="h-full rounded-md flex items-center justify-end pr-1.5"
                style={{
                  background: item.correct
                    ? "linear-gradient(90deg, #7ab8ae, #579F93)"
                    : "linear-gradient(90deg, #fca5a5, #f87171)",
                }}
                initial={{ width: "0%" }}
                animate={{ width: `${(item.timeSeconds / maxT) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
              >
                {item.timeSeconds / maxT > 0.25 && (
                  <span className="text-[10px] font-bold text-white">{item.timeSeconds.toFixed(1)}s</span>
                )}
              </motion.div>
            </div>
            <span className="w-5 text-center text-sm shrink-0">{item.correct ? "✓" : "✗"}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between pt-2 border-t border-stone-200 dark:border-stone-700 text-[11px] text-stone-400 dark:text-stone-500">
        <span>Promedio: {avgTime.toFixed(1)}s por pregunta</span>
        <span>Más lenta: P{merged[slowestIdx].num}</span>
      </div>
    </div>
  );
}

type Props = {
  isTimedReading: boolean;
  exerciseTitle: string;
  backHref: string;
  isCompleting: boolean;
  gemsAwarded: number | null;
  initialGems: number;
  finalTimeSeconds: number;
  wordsPerMinute: number;
  wordCount: number;
  correctCount: number;
  totalQuestions: number;
  earnedPoints: number;
  totalPoints: number;
  totalTimeSeconds: number;
  readingTimeSeconds?: number;
  maxReadingTime?: number;
  expectedPPM?: number;
  readingWordCount?: number;
  answers?: AnswerResult[];
  questions?: Question[];
  previousAttempts?: { score: number; date: string }[];
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({ opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut", delay } }),
};

export function PhaseResults({
  isTimedReading,
  exerciseTitle,
  backHref,
  isCompleting,
  gemsAwarded,
  initialGems,
  finalTimeSeconds,
  wordsPerMinute,
  wordCount,
  correctCount,
  totalQuestions,
  earnedPoints,
  totalPoints,
  totalTimeSeconds,
  readingTimeSeconds,
  maxReadingTime,
  expectedPPM,
  readingWordCount,
  answers = [],
  questions = [],
  previousAttempts = [],
}: Props) {
  useEffect(() => {
    if (isTimedReading) return;
    const pct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    if (pct !== 100) return;
    let cleanup: (() => void) | undefined;
    const t0 = setTimeout(() => { cleanup = fireWinConfetti(); }, 50);
    return () => { clearTimeout(t0); cleanup?.(); };
  }, [isTimedReading, correctCount, totalQuestions]);

  if (isTimedReading) {
    const msg = getWpmMsg(wordsPerMinute);
    const hasSpeed = expectedPPM && expectedPPM > 0;
    return (
      <>
        <GemCounter initialGems={initialGems} gemsAwarded={gemsAwarded} isCompleting={isCompleting} />
        <div className="min-h-screen bg-gradient-to-b from-[#fefcf8] to-[#f5f0e8] dark:from-stone-900 dark:to-stone-950 flex justify-center px-4 pt-10 pb-36 md:pb-12">
          <div className="w-full max-w-[420px] md:max-w-[860px] flex flex-col gap-4">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="text-center">
              <div className="text-5xl leading-none mb-1">{msg.emoji}</div>
              <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">{msg.title}</h1>
              <p className="text-stone-500 dark:text-stone-400 dark:text-stone-500 text-sm">{msg.subtitle}</p>
              <p className="text-stone-400 dark:text-stone-500 text-xs mt-1">{exerciseTitle}</p>
            </motion.div>
            <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:items-start md:gap-6">
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.15} className={!hasSpeed ? "md:col-span-2" : ""}>
                <TimeCard totalTimeSeconds={finalTimeSeconds} wordCount={readingWordCount ?? wordCount} />
              </motion.div>
              {hasSpeed && (
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.3}>
                  <SpeedMeter actualPPM={wordsPerMinute} expectedPPM={expectedPPM} />
                </motion.div>
              )}
            </div>
            {previousAttempts.length > 0 && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={hasSpeed ? 0.45 : 0.3}>
                <MiniEvolutionChart attempts={previousAttempts} />
              </motion.div>
            )}
            <div className="hidden md:block mt-2">
              <Button size="lg" className="w-full max-w-[420px] mx-auto flex h-14 text-base font-bold" style={{ backgroundColor: "#2E85C8", color: "#fff" }} asChild>
                <Link href={backHref}>Volver a ejercicios</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="md:hidden fixed bottom-0 left-0 right-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8 bg-gradient-to-t from-[#f5f0e8] dark:from-stone-950 to-transparent">
          <Button size="lg" className="w-full max-w-[420px] mx-auto flex h-14 text-base font-bold" style={{ backgroundColor: "#2E85C8", color: "#fff" }} asChild>
            <Link href={backHref}>Volver a ejercicios</Link>
          </Button>
        </div>
      </>
    );
  }

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const msg = getMotivationalMsg(percentage);
  const hasSpeed = readingTimeSeconds !== undefined && expectedPPM && expectedPPM > 0 && readingWordCount && readingWordCount > 0;
  const actualPPM = hasSpeed ? calculatePPM(readingWordCount!, readingTimeSeconds!) : 0;

  return (
    <>
      <GemCounter initialGems={initialGems} gemsAwarded={gemsAwarded} isCompleting={isCompleting} />
      <div className="min-h-screen bg-gradient-to-b from-[#fefcf8] to-[#f5f0e8] dark:from-stone-900 dark:to-stone-950 flex justify-center px-4 pt-6 pb-36 md:pb-12">
        <div className="w-full max-w-[420px] md:max-w-[900px] flex flex-col gap-4">

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="text-center">
            <div className="text-5xl leading-none mb-1">{msg.emoji}</div>
            <h1 className="text-[1.65rem] font-black text-stone-900 dark:text-stone-100 mt-1 leading-tight">{msg.title}</h1>
            <p className="text-stone-500 dark:text-stone-400 dark:text-stone-500 text-sm mt-0.5">{msg.subtitle}</p>
            <p className="text-stone-400 dark:text-stone-500 text-xs mt-1">{exerciseTitle}</p>
          </motion.div>

          <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:items-start md:gap-6">
            <div className="contents md:flex md:flex-col md:gap-4">
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.15} className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="shrink-0 rounded-2xl bg-[#faf7f2] dark:bg-stone-800 py-4 px-3 flex flex-col items-center gap-2">
                    <DonutChart percentage={percentage} />
                    <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Aciertos</span>
                  </div>
                  <ScoreCountCard correct={correctCount} total={totalQuestions} />
                </div>
                <TimeCard
                  readingTimeSeconds={readingTimeSeconds}
                  totalTimeSeconds={totalTimeSeconds}
                  wordCount={readingWordCount && readingWordCount > 0 ? readingWordCount : undefined}
                />
              </motion.div>
              {hasSpeed && (
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.3}>
                  <SpeedMeter actualPPM={actualPPM} expectedPPM={expectedPPM!} />
                </motion.div>
              )}
            </div>

            <div className="contents md:flex md:flex-col md:gap-4">
              {previousAttempts.length > 0 && (
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={hasSpeed ? 0.45 : 0.3}>
                  <MiniEvolutionChart attempts={previousAttempts} />
                </motion.div>
              )}
              {questions.length > 0 && answers.length > 0 && (
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={hasSpeed ? 0.6 : previousAttempts.length > 0 ? 0.45 : 0.3}>
                  <QuestionTimeline questions={questions} answers={answers} maxSeconds={maxReadingTime} />
                </motion.div>
              )}
            </div>
          </div>

          <div className="hidden md:block mt-2">
            <Button size="lg" className="w-full max-w-[420px] mx-auto flex h-14 text-base font-bold" asChild>
              <Link href={backHref}>Volver a ejercicios</Link>
            </Button>
          </div>

        </div>
      </div>
      <div className="md:hidden fixed bottom-0 left-0 right-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8 bg-gradient-to-t from-[#f5f0e8] dark:from-stone-950 to-transparent">
        <Button size="lg" className="w-full max-w-[420px] mx-auto flex h-14 text-base font-bold" asChild>
          <Link href={backHref}>Volver a ejercicios</Link>
        </Button>
      </div>
    </>
  );
}
