"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { getScheme } from "../world-color-schemes";
import { WorldCanvas } from "../world-canvas";
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

export function WorldExercisesList({
  exercises,
  completedExerciseIds,
  worldName,
}: {
  exercises: ExerciseItem[];
  completedExerciseIds: string[];
  worldName: string;
}) {
  const scheme = getScheme(worldName);
  const completedSet = new Set(completedExerciseIds);

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
  const completedExercises = nonBonusExercises.filter((e) => completedSet.has(e.id)).length;
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
          const isCompleted = completedSet.has(exercise.id);
          const isLeft = index % 2 === 0;

          const card = (
            <div
              className={`w-[92%] ${isLeft ? "mr-auto" : "ml-auto"} rounded-2xl border overflow-hidden transition-all duration-200 active:scale-[0.97] hover:scale-[1.04] cursor-pointer`}
              style={{
                background: isCompleted ? "rgba(240,253,244,1)" : "rgba(255,250,235,1)",
                borderColor: isCompleted ? "rgba(16,185,129,0.5)" : `${scheme.particles}88`,
                boxShadow: isCompleted
                  ? "0 2px 8px rgba(16,185,129,0.18)"
                  : `0 4px 20px ${scheme.particles}33, 0 2px 6px rgba(0,0,0,0.12)`,
              }}
            >
              <div className="flex items-center gap-3 px-3 py-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                  style={{
                    background: `${scheme.particles}18`,
                    border: `2px solid ${scheme.particles}45`,
                    color: scheme.particles,
                  }}
                >
                  {exercise.position}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm leading-tight" style={{ color: "rgba(0,0,0,1)" }}>
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
                                ? `${scheme.particles}cc`
                                : "rgba(0,0,0,0.08)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-center gap-1">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <PlayCircle className="h-5 w-5" style={{ color: scheme.particles }} />
                  )}
                  <span
                    className="text-[9px] font-bold tracking-wider uppercase"
                    style={{
                      color: isCompleted ? "rgba(16,185,129,0.9)" : `${scheme.particles}dd`,
                    }}
                  >
                    {isCompleted ? "Listo" : "Jugar"}
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
              <Link href={`/ejercicios/${exercise.id}`}>{card}</Link>
            </div>
          );
        })}
      </div>
    </>
  );
}
