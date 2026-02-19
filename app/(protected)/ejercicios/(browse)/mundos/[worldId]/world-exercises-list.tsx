"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, PlayCircle, Lock } from "lucide-react";
import { getScheme } from "../world-color-schemes";
import { WorldCanvas } from "../world-canvas";
import { getWorldConfig } from "@/lib/worlds";

type ExerciseItem = {
  id: string;
  title: string;
  instructions: string;
  difficultyLevel: number;
  typeName: string | null;
  position: number;
  isBonus: boolean;
};

type ExerciseState = "completed" | "unlocked" | "locked";

function getExerciseState(
  position: number,
  isBonus: boolean,
  lastCompletedPosition: number,
  exercises: ExerciseItem[]
): ExerciseState {
  if (position <= lastCompletedPosition) return "completed";
  if (position === 1 && lastCompletedPosition === 0) return "unlocked";

  if (isBonus) {
    const prevNonBonus = exercises
      .filter((e) => !e.isBonus && e.position < position)
      .sort((a, b) => b.position - a.position)[0];
    if (!prevNonBonus || prevNonBonus.position <= lastCompletedPosition) return "unlocked";
    return "locked";
  }

  const prevNonBonusPositions = exercises
    .filter((e) => !e.isBonus && e.position < position)
    .map((e) => e.position);

  if (prevNonBonusPositions.length === 0) return "unlocked";
  const maxPrev = Math.max(...prevNonBonusPositions);
  return maxPrev <= lastCompletedPosition ? "unlocked" : "locked";
}

export function WorldExercisesList({
  exercises,
  lastCompletedPosition,
  worldName,
}: {
  exercises: ExerciseItem[];
  lastCompletedPosition: number;
  worldName: string;
}) {
  const scheme = getScheme(worldName);

  if (exercises.length === 0) {
    const worldConfig = getWorldConfig(worldName);
    return (
      <>
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            background: scheme.background.startsWith("/")
              ? `url(${scheme.background}) center/cover no-repeat`
              : scheme.background,
          }}
        />
        <WorldCanvas worldName={worldName} isActive={true} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6">
          {worldConfig?.characterImage && (
            <div className="relative w-40 h-40">
              <Image
                src={worldConfig.characterImage}
                alt="Personaje del mundo"
                fill
                className="object-contain drop-shadow-2xl"
              />
            </div>
          )}
          <div
            className="rounded-2xl px-6 py-5 text-center max-w-xs"
            style={{
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <p
              className="text-lg font-bold mb-1"
              style={{ color: scheme.particles, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
            >
              Sin ejercicios actualmente
            </p>
            <p className="text-sm text-white/60">
              Pronto habrá nuevas aventuras en este mundo. ¡Vuelve pronto!
            </p>
          </div>
        </div>
      </>
    );
  }

  const nonBonusExercises = exercises.filter((e) => !e.isBonus);
  const totalExercises = nonBonusExercises.length;
  const completedExercises = nonBonusExercises.filter(
    (e) => e.position <= lastCompletedPosition
  ).length;
  const progressPct = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  return (
    <>
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: scheme.background.startsWith("/")
            ? `url(${scheme.background}) center/cover no-repeat`
            : scheme.background,
        }}
      />
      <WorldCanvas worldName={worldName} isActive={true} />

      {totalExercises > 0 && (
        <div
          className="mb-4 rounded-xl px-3 py-2 flex flex-col gap-1.5"
          style={{
            background: "rgba(0,0,0,0.25)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-semibold text-white/80"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
            >
              Progreso
            </span>
            <span
              className="text-xs font-bold tabular-nums"
              style={{ color: scheme.particles, textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
            >
              {completedExercises} / {totalExercises}
            </span>
          </div>
          <div
            className="relative w-full rounded-full overflow-hidden"
            style={{ height: "7px", background: "rgba(255,255,255,0.10)" }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, ${scheme.particles}cc, ${scheme.particles})`,
                boxShadow: `0 0 8px ${scheme.particles}80`,
              }}
            />
          </div>
          {completedExercises === totalExercises && totalExercises > 0 && (
            <p
              className="text-xs font-bold text-center"
              style={{ color: scheme.particles, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
            >
              ¡Mundo completado!
            </p>
          )}
        </div>
      )}

      <div className="pb-10">
        {exercises.map((exercise, index) => {
          const state = getExerciseState(
            exercise.position,
            exercise.isBonus,
            lastCompletedPosition,
            exercises
          );
          const isLeft = index % 2 === 0;
          const isClickable = state !== "locked";

          const card = (
            <div
              className={`w-[92%] ${isLeft ? "mr-auto" : "ml-auto"} rounded-2xl border overflow-hidden transition-all duration-200 ${isClickable ? "active:scale-[0.97] hover:scale-[1.04] cursor-pointer" : "cursor-default"}`}
              style={{
                background:
                  state === "completed"
                    ? "rgba(240,253,244,1)"
                    : state === "unlocked"
                    ? "rgba(255,250,235,1)"
                    : "rgba(245,240,228,0.75)",
                borderColor:
                  state === "completed"
                    ? "rgba(16,185,129,0.5)"
                    : state === "unlocked"
                    ? `${scheme.particles}88`
                    : "rgba(0,0,0,0.10)",
                boxShadow:
                  state === "unlocked"
                    ? `0 4px 20px ${scheme.particles}33, 0 2px 6px rgba(0,0,0,0.12)`
                    : state === "completed"
                    ? "0 2px 8px rgba(16,185,129,0.18)"
                    : "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <div className="flex items-center gap-3 px-3 py-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                  style={{
                    background: state === "locked" ? "rgba(0,0,0,0.06)" : `${scheme.particles}18`,
                    border: `2px solid ${state === "locked" ? "rgba(0,0,0,0.08)" : `${scheme.particles}45`}`,
                    color: state === "locked" ? "rgba(0,0,0,0.25)" : scheme.particles,
                  }}
                >
                  {exercise.position}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className="font-bold text-sm leading-tight"
                      style={{
                        color: state === "locked" ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,1)",
                      }}
                    >
                      {exercise.title}
                    </p>
                    {exercise.isBonus && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0"
                        style={{
                          background: `${scheme.particles}20`,
                          color: scheme.particles,
                          border: `1px solid ${scheme.particles}40`,
                        }}
                      >
                        Bonus
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {exercise.typeName && (
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(0,0,0,0.05)",
                          color: "rgba(0,0,0,0.4)",
                        }}
                      >
                        {exercise.typeName}
                      </span>
                    )}
                    <div className="flex gap-0.5 items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background:
                              i < exercise.difficultyLevel
                                ? state === "locked"
                                  ? "rgba(0,0,0,0.1)"
                                  : `${scheme.particles}cc`
                                : "rgba(0,0,0,0.08)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-center gap-1">
                  {state === "completed" && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  )}
                  {state === "unlocked" && (
                    <PlayCircle className="h-5 w-5" style={{ color: scheme.particles }} />
                  )}
                  {state === "locked" && (
                    <Lock className="h-4 w-4 text-black/20" />
                  )}
                  <span
                    className="text-[9px] font-bold tracking-wider uppercase"
                    style={{
                      color:
                        state === "completed"
                          ? "rgba(16,185,129,0.9)"
                          : state === "unlocked"
                          ? `${scheme.particles}dd`
                          : "rgba(0,0,0,0.2)",
                    }}
                  >
                    {state === "completed" ? "Listo" : state === "unlocked" ? "Jugar" : "Bloq."}
                  </span>
                </div>
              </div>
            </div>
          );

          return (
            <div key={exercise.id}>
              {index > 0 && (
                <div className={`flex py-1 ${isLeft ? "justify-start pl-[4%]" : "justify-end pr-[4%]"}`}>
                  <div
                    className="w-0.5 h-5 rounded-full"
                    style={{ background: `${scheme.particles}55` }}
                  />
                </div>
              )}
              {isClickable ? (
                <Link href={`/ejercicios/${exercise.id}`}>{card}</Link>
              ) : (
                card
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
