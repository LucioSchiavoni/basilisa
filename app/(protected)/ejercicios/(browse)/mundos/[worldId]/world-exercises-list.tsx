"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, ChevronRight, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getScheme } from "../world-color-schemes";
import { getWorldConfig } from "@/lib/worlds";

type ExerciseItem = {
  id: string;
  title: string;
  instructions: string | null;
  difficultyLevel: number;
  typeName: string | null;
  position: number;
  isBonus: boolean;
};

const NODE_OFFSETS = [0, 45, 60, 30, -30, -60, -45, 0, 45, 60] as const;

function getNodeOffset(index: number): number {
  return NODE_OFFSETS[index % NODE_OFFSETS.length];
}

export function WorldExercisesList({
  exercises,
  completedExerciseIds,
  worldName,
  displayName,
  worldId,
}: {
  exercises: ExerciseItem[];
  completedExerciseIds: string[];
  worldName: string;
  displayName: string;
  worldId: string;
}) {
  const scheme = getScheme(worldName);
  const completedSet = new Set(completedExerciseIds);
  const worldConfig = getWorldConfig(worldName);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6">
        {worldConfig?.characterImage && (
          <div className="relative w-48 h-48">
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
    );
  }

  const nonBonusExercises = exercises.filter((e) => !e.isBonus);
  const totalExercises = nonBonusExercises.length;
  const completedExercises = nonBonusExercises.filter((e) => completedSet.has(e.id)).length;
  const progressPct = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
  const isWorldComplete = completedExercises === totalExercises && totalExercises > 0;

  const selectedIsCompleted = selectedExercise ? completedSet.has(selectedExercise.id) : false;

  return (
    <>
      <div className="px-4">
        <div
          className="max-w-md mx-auto rounded-2xl p-3 flex items-center relative overflow-visible"
          style={{
            paddingLeft: worldConfig?.characterImage ? "9rem" : "0.75rem",
            background: `linear-gradient(135deg, color-mix(in srgb, ${scheme.particles} 38%, #000000) 0%, color-mix(in srgb, ${scheme.particles} 18%, #000000) 100%)`,
            border: `1px solid ${scheme.particles}55`,
            boxShadow: `0 4px 20px rgba(0,0,0,0.35), 0 0 20px ${scheme.particles}18`,
          }}
        >
          {worldConfig?.characterImage && (
            <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center" style={{ width: "9rem" }}>
              <Image
                src={worldConfig.characterImage}
                alt={`Personaje de ${displayName}`}
                width={192}
                height={192}
                className="w-48 h-48 sm:w-52 sm:h-52 object-contain drop-shadow-2xl"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2
              className="text-lg sm:text-xl font-bold leading-tight"
              style={{ color: "#ffffff", textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}
            >
              {displayName}
            </h2>

            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="text-sm font-bold tabular-nums"
                style={{ color: scheme.particles, textShadow: `0 0 8px ${scheme.particles}80` }}
              >
                {completedExercises}/{totalExercises}
              </span>
              <span className="text-xs text-white/60">completados</span>
            </div>

            <div className="mt-1.5">
              <div
                className="relative w-full rounded-full overflow-hidden"
                style={{ height: "6px", background: "rgba(0,0,0,0.35)" }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${progressPct}%`,
                    background: `linear-gradient(90deg, ${scheme.particles}cc, ${scheme.particles})`,
                    boxShadow: `0 0 6px ${scheme.particles}70`,
                  }}
                />
              </div>
            </div>

            {isWorldComplete && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Star className="h-3 w-3 fill-current" style={{ color: scheme.particles }} />
                <span
                  className="text-xs font-bold"
                  style={{ color: scheme.particles, textShadow: `0 0 6px ${scheme.particles}80` }}
                >
                  ¡Completado!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-0 pb-16 mt-14">
        {exercises.map((exercise, index) => {
          const isCompleted = completedSet.has(exercise.id);
          const offset = getNodeOffset(index);
          const hasNext = index < exercises.length - 1;
          const isSelected = selectedExercise?.id === exercise.id;

          return (
            <div key={exercise.id} className="flex flex-col items-center">
              <div
                className="relative flex flex-col items-center"
                style={{ transform: `translateX(${offset}px)`, zIndex: isSelected ? 50 : undefined }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedExercise(isSelected ? null : exercise)}
                  className="group relative cursor-pointer"
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: isCompleted
                        ? "rgba(16,185,129,0.25)"
                        : `${scheme.particles}20`,
                      filter: "blur(12px)",
                      transform: "scale(1.3)",
                    }}
                  />

                  <div
                    className={cn(
                      "relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full transition-transform duration-150",
                      isSelected
                        ? "scale-110"
                        : "group-hover:scale-110 group-active:translate-y-[3px] group-active:scale-100"
                    )}
                  >
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: isCompleted
                          ? "#0d9668"
                          : `color-mix(in srgb, ${scheme.particles} 80%, #000000)`,
                        transform: "translateY(4px)",
                      }}
                    />

                    <div
                      className={cn(
                        "absolute inset-0 rounded-full flex items-center justify-center transition-transform duration-150",
                        isSelected ? "" : "group-active:translate-y-[3px]"
                      )}
                      style={{
                        background: isCompleted
                          ? "linear-gradient(180deg, #34d399 0%, #10b981 100%)"
                          : `linear-gradient(180deg, ${scheme.particles}, color-mix(in srgb, ${scheme.particles} 85%, #000000))`,
                        boxShadow: isSelected
                          ? `0 0 0 4px rgba(255,255,255,0.3), 0 0 20px ${isCompleted ? "rgba(16,185,129,0.4)" : `${scheme.particles}40`}`
                          : isCompleted
                            ? "inset 0 -2px 4px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.25)"
                            : "inset 0 -2px 4px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.2)",
                      }}
                    >
                      {isCompleted ? (
                        <Check className="h-7 w-7 sm:h-8 sm:w-8 text-white" strokeWidth={3} />
                      ) : (
                        <span className="text-lg sm:text-xl font-bold text-white drop-shadow-sm">
                          {exercise.position}
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {isSelected && selectedExercise && (
                  <div
                    className="absolute z-50 w-52 rounded-xl p-3 animate-in fade-in duration-200 top-full left-1/2 -translate-x-1/2 mt-2 sm:top-1/2 sm:left-full sm:ml-4 sm:translate-x-0 sm:-translate-y-1/2 sm:mt-0"
                    style={{
                      background: `color-mix(in srgb, ${scheme.particles} 90%, #000000)`,
                      border: `1px solid ${scheme.particles}50`,
                      boxShadow: `0 8px 24px rgba(0,0,0,0.35), 0 0 16px ${scheme.particles}15`,
                    }}
                  >
                    <div
                      className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 sm:hidden"
                      style={{
                        background: `color-mix(in srgb, ${scheme.particles} 90%, #000000)`,
                        borderTop: `1px solid ${scheme.particles}50`,
                        borderLeft: `1px solid ${scheme.particles}50`,
                      }}
                    />
                    <div
                      className="absolute top-1/2 -left-[7px] -translate-y-1/2 w-3 h-3 rotate-45 hidden sm:block"
                      style={{
                        background: `color-mix(in srgb, ${scheme.particles} 90%, #000000)`,
                        borderLeft: `1px solid ${scheme.particles}50`,
                        borderBottom: `1px solid ${scheme.particles}50`,
                      }}
                    />

                    <div className="flex items-start justify-between gap-1.5 mb-2">
                      <p className="text-white font-bold text-[13px] leading-tight flex-1 min-w-0">
                        {selectedExercise.title}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExercise(null);
                        }}
                        className="shrink-0 p-0.5 rounded-full text-white/50 hover:text-white transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {selectedExercise.typeName && (
                      <span
                        className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider mb-2"
                        style={{
                          background: "rgba(255,255,255,0.15)",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        {selectedExercise.typeName}
                      </span>
                    )}

                    {selectedIsCompleted && (
                      <div className="flex items-center gap-1 mb-2">
                        <Check className="h-3 w-3 text-emerald-300" strokeWidth={3} />
                        <span className="text-[10px] font-semibold text-emerald-300">
                          Completado
                        </span>
                      </div>
                    )}

                    <Link
                      href={`/ejercicios/${selectedExercise.id}?worldId=${worldId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center gap-1.5 w-full rounded-lg py-2 text-[13px] font-semibold transition-all hover:brightness-110"
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        color: "#ffffff",
                      }}
                    >
                      {selectedIsCompleted ? "Repetir" : "¡Empezar!"}
                      <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </Link>
                  </div>
                )}
              </div>

              {hasNext && (
                <svg
                  width="24"
                  height="36"
                  viewBox="0 0 24 36"
                  className="my-1"
                  style={{
                    transform: `translateX(${(offset + getNodeOffset(index + 1)) / 2}px)`,
                  }}
                >
                  <circle cx="12" cy="8" r="2.5" fill={`${scheme.particles}50`} />
                  <circle cx="12" cy="18" r="2" fill={`${scheme.particles}35`} />
                  <circle cx="12" cy="28" r="1.5" fill={`${scheme.particles}25`} />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {selectedExercise && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSelectedExercise(null)}
        />
      )}
    </>
  );
}
