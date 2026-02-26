"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Exercise = {
  id: string;
  title: string;
  instructions: string | null;
  difficulty_level: number;
  tags: string[];
  typeName: string | null;
};

const difficultyLabels: Record<number, string> = {
  1: "Muy fácil",
  2: "Fácil",
  3: "Intermedio",
  4: "Difícil",
  5: "Muy difícil",
};

const nodeColors: Record<number, { bg: string; ring: string; shadow: string }> = {
  1: {
    bg: "bg-green-500",
    ring: "ring-green-300 dark:ring-green-700",
    shadow: "shadow-green-500/40",
  },
  2: {
    bg: "bg-emerald-500",
    ring: "ring-emerald-300 dark:ring-emerald-700",
    shadow: "shadow-emerald-500/40",
  },
  3: {
    bg: "bg-yellow-500",
    ring: "ring-yellow-300 dark:ring-yellow-700",
    shadow: "shadow-yellow-500/40",
  },
  4: {
    bg: "bg-orange-500",
    ring: "ring-orange-300 dark:ring-orange-700",
    shadow: "shadow-orange-500/40",
  },
  5: {
    bg: "bg-red-500",
    ring: "ring-red-300 dark:ring-red-700",
    shadow: "shadow-red-500/40",
  },
};

function getNodeOffset(index: number): number {
  const pattern = [0, 1, 1.5, 1, 0, -1, -1.5, -1];
  return pattern[index % pattern.length];
}

export function ExercisePath({ exercises }: { exercises: Exercise[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  function handleToggle(id: string) {
    setActiveId((prev) => (prev === id ? null : id));
  }

  useEffect(() => {
    if (!activeId || !cardRef.current) return;
    const timer = setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    return () => clearTimeout(timer);
  }, [activeId]);

  return (
    <div className="relative flex flex-col items-center py-6 pb-32">
      {exercises.map((exercise, index) => {
        const offset = getNodeOffset(index);
        const colors = nodeColors[exercise.difficulty_level] || nodeColors[3];
        const isActive = activeId === exercise.id;
        const isLast = index === exercises.length - 1;
        const labelOnLeft = offset >= 0;

        return (
          <div key={exercise.id} className="flex flex-col items-center w-full">
            <div
              className="relative transition-transform duration-500 ease-out"
              style={{ transform: `translateX(${offset * 44}px)` }}
            >
              <button
                type="button"
                onClick={() => handleToggle(exercise.id)}
                className={cn(
                  "relative z-10 flex items-center justify-center",
                  "h-[4.2rem] w-[4.2rem] rounded-full",
                  "ring-[5px] transition-all duration-300",
                  "active:scale-90",
                  colors.bg,
                  colors.ring,
                  isActive
                    ? `scale-110 shadow-lg ${colors.shadow}`
                    : "hover:scale-105 hover:shadow-md"
                )}
                aria-label={exercise.title}
                aria-expanded={isActive}
              >
                <BookOpen className="h-7 w-7 text-white drop-shadow" />
              </button>

              <span
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 whitespace-nowrap",
                  "text-xs font-semibold text-muted-foreground max-w-[8rem] truncate",
                  "pointer-events-none select-none",
                  "transition-opacity duration-300",
                  isActive ? "opacity-0" : "opacity-100",
                  labelOnLeft ? "right-full mr-3" : "left-full ml-3"
                )}
              >
                {exercise.title}
              </span>
            </div>

            <div
              ref={isActive ? cardRef : undefined}
              className={cn("w-full overflow-hidden", isActive && "relative z-20")}
              style={{
                display: "grid",
                gridTemplateRows: isActive ? "1fr" : "0fr",
                transition: "grid-template-rows 350ms ease-out, opacity 300ms ease-out",
                opacity: isActive ? 1 : 0,
              }}
            >
              <div className="min-h-0">
                <div className="px-4 pt-3 pb-1">
                  <div className="max-w-sm mx-auto rounded-2xl border bg-card text-card-foreground shadow-xl">
                    <div className="p-4 space-y-3">
                      <h3 className="font-bold text-base leading-tight">
                        {exercise.title}
                      </h3>

                      <p className="text-sm text-muted-foreground leading-snug">
                        {exercise.instructions}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap">
                        {exercise.typeName && (
                          <Badge variant="outline" className="text-xs">
                            {exercise.typeName}
                          </Badge>
                        )}
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3.5 w-3.5",
                                i < exercise.difficulty_level
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/30"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {difficultyLabels[exercise.difficulty_level]}
                        </span>
                      </div>

                      {exercise.tags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap">
                          {exercise.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Button asChild className="w-full h-12 text-sm font-bold rounded-xl">
                        <Link href={`/ejercicios/${exercise.id}`}>
                          Comenzar
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {!isLast && (
              <PathSegment
                fromOffset={offset}
                toOffset={getNodeOffset(index + 1)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PathSegment({
  fromOffset,
  toOffset,
}: {
  fromOffset: number;
  toOffset: number;
}) {
  const height = 40;
  const scale = 44;
  const cx = 100;
  const x1 = cx + fromOffset * scale;
  const x2 = cx + toOffset * scale;

  return (
    <svg
      width="200"
      height={height}
      viewBox={`0 0 200 ${height}`}
      className="overflow-visible my-0.5"
      aria-hidden
    >
      <path
        d={`M ${x1} 0 C ${x1} ${height * 0.55}, ${x2} ${height * 0.45}, ${x2} ${height}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="6 8"
        className="text-muted-foreground/25"
      />
    </svg>
  );
}
