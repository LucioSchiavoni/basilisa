"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Check, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT = "#2E85C8";
const COMPLETED = "#579F93";
const BANNER = "#C73341";

type ExerciseItem = {
  id: string;
  title: string;
  instructions: string | null;
  difficultyLevel: number;
  position: number;
};

const NODE_OFFSETS = [0, 45, 60, 30, -30, -60, -45, 0, 45, 60] as const;

function getNodeOffset(index: number): number {
  return NODE_OFFSETS[index % NODE_OFFSETS.length];
}

function MathIcon({ color }: { color: string }) {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="9" y1="12" x2="15" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="12" y1="9" x2="12" y2="15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="19" y1="9" x2="25" y2="15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="25" y1="9" x2="19" y2="15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="9" y1="22" x2="15" y2="22" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="22" cy="19.5" r="1.1" fill={color} />
      <line x1="19" y1="22.5" x2="25" y2="22.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="22" cy="25.5" r="1.1" fill={color} />
    </svg>
  );
}

export function MatematicasExercisesList({
  exercises,
  completedExerciseIds,
}: {
  exercises: ExerciseItem[];
  completedExerciseIds: string[];
}) {
  const completedSet = new Set(completedExerciseIds);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6">
        <div
          className="rounded-2xl px-6 py-5 text-center max-w-xs"
          style={{
            background: "rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <p className="text-lg font-bold mb-1 text-foreground">Sin ejercicios disponibles</p>
          <p className="text-sm text-muted-foreground">
            Pronto habrá ejercicios de matemáticas. ¡Vuelve pronto!
          </p>
        </div>
      </div>
    );
  }

  const totalExercises = exercises.length;
  const completedExercises = exercises.filter((e) => completedSet.has(e.id)).length;
  const isAllComplete = completedExercises === totalExercises && totalExercises > 0;
  const selectedIsCompleted = selectedExercise ? completedSet.has(selectedExercise.id) : false;

  return (
    <>
      <div className="-mx-4 lg:mx-0 px-3 sm:px-8 lg:px-20 py-2.5">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: BANNER,
            boxShadow: `0 6px 0 color-mix(in srgb, ${BANNER} 55%, #000), 0 8px 20px rgba(0,0,0,0.22)`,
          }}
        >
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 55%)",
            }}
          />

          <div className="relative flex items-center justify-between gap-2 px-3 sm:px-5 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link
                href="/ejercicios"
                className="shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all hover:bg-white/25 active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.22)",
                  color: "#ffffff",
                  boxShadow: "0 2px 0 rgba(0,0,0,0.15)",
                }}
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
              </Link>
              <div className="min-w-0">
                <p
                  className="hidden sm:block text-[9px] font-semibold tracking-widest uppercase leading-none mb-0.5"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                >
                  Área especial
                </p>
                <h1
                  className="text-base sm:text-lg font-bold leading-tight truncate"
                  style={{ color: "#ffffff", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
                >
                  Matemáticas
                </h1>
              </div>
            </div>

            <div
              className="shrink-0 flex items-center gap-1.5 sm:gap-2 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2"
              style={{
                background: "rgba(0,0,0,0.18)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white/80" />
              <span className="text-xs sm:text-[13px] font-bold text-white tabular-nums">
                {completedExercises}
                <span className="text-white/55 font-medium">/{totalExercises}</span>
              </span>
              {isAllComplete && (
                <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" strokeWidth={3} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-0 pb-16 mt-10">
        {exercises.map((exercise, index) => {
          const isCompleted = completedSet.has(exercise.id);
          const nodeColor = isCompleted ? COMPLETED : ACCENT;
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
                      background: `${nodeColor}25`,
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
                        background: `${nodeColor}20`,
                        transform: "translateY(4px)",
                      }}
                    />

                    <div
                      className={cn(
                        "absolute inset-0 rounded-full flex items-center justify-center transition-transform duration-150",
                        isSelected ? "" : "group-active:translate-y-[3px]"
                      )}
                      style={{
                        background: "#FFFFFF",
                        border: `3px solid ${nodeColor}`,
                        boxShadow: isSelected
                          ? `0 0 0 4px ${nodeColor}40, 0 0 20px ${nodeColor}40`
                          : "inset 0 -2px 4px rgba(0,0,0,0.05)",
                      }}
                    >
                      <MathIcon color={nodeColor} />
                    </div>

                    {isCompleted && (
                      <div
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center z-10"
                        style={{ background: COMPLETED, border: "2px solid #ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
                      >
                        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
                      </div>
                    )}
                  </div>
                </button>

                {isSelected && selectedExercise && (
                  <div
                    className="absolute z-50 w-52 rounded-xl p-3 animate-in fade-in duration-200 top-full left-1/2 -translate-x-1/2 mt-2 sm:top-1/2 sm:left-full sm:ml-4 sm:translate-x-0 sm:-translate-y-1/2 sm:mt-0"
                    style={{
                      background: `color-mix(in srgb, ${BANNER} 90%, #000000)`,
                      border: `1px solid ${BANNER}50`,
                      boxShadow: `0 8px 24px rgba(0,0,0,0.35), 0 0 16px ${BANNER}15`,
                    }}
                  >
                    <div
                      className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 sm:hidden"
                      style={{
                        background: `color-mix(in srgb, ${BANNER} 90%, #000000)`,
                        borderTop: `1px solid ${BANNER}50`,
                        borderLeft: `1px solid ${BANNER}50`,
                      }}
                    />
                    <div
                      className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rotate-45 hidden sm:block"
                      style={{
                        background: `color-mix(in srgb, ${BANNER} 90%, #000000)`,
                        borderLeft: `1px solid ${BANNER}50`,
                        borderBottom: `1px solid ${BANNER}50`,
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

                    {selectedIsCompleted && (
                      <div className="flex items-center gap-1 mb-2">
                        <Check className="h-3 w-3 text-emerald-300" strokeWidth={3} />
                        <span className="text-[10px] font-semibold text-emerald-300">Completado</span>
                      </div>
                    )}

                    <Link
                      href={`/ejercicios/${selectedExercise.id}`}
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
                  <circle cx="12" cy="8" r="2.5" fill={`${ACCENT}50`} />
                  <circle cx="12" cy="18" r="2" fill={`${ACCENT}35`} />
                  <circle cx="12" cy="28" r="1.5" fill={`${ACCENT}25`} />
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
