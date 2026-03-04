"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { getScheme } from "./world-color-schemes";
import { useWorldTheme } from "@/components/world-theme-context";
import { FloatingParticles } from "@/components/home/floating-particles";

type WorldData = {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  iconUrl: string | null;
  difficultyLevel: number | null;
  difficultyLabel: string | null;
  therapeuticDescription: string | null;
  totalExercises: number;
  completedExercises: number;
};

function WorldCard({ world, index }: { world: WorldData; index: number }) {
  const scheme = getScheme(world.name);
  const progress =
    world.totalExercises > 0
      ? Math.round((world.completedExercises / world.totalExercises) * 100)
      : 0;

  return (
    <Link
      href={`/ejercicios/mundos/${world.id}`}
      className="relative flex h-44 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
      style={{
        animation: "fadeInUp 0.4s ease-out backwards",
        animationDelay: `${index * 80}ms`,
        background: scheme.navGradient,
      }}
    >
      {world.iconUrl && (
        <Image
          src={world.iconUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(min-width: 672px) 672px, 100vw"
          priority={index < 2}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      <div className="relative flex items-end w-full px-6 py-5">
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {world.difficultyLabel && (
            <span
              className="self-start text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
              style={{ color: scheme.particles, background: `${scheme.particles}28` }}
            >
              {world.difficultyLabel}
            </span>
          )}

          <h2 className="font-serif font-bold text-white text-2xl leading-none drop-shadow">
            {world.displayName}
          </h2>

          {world.description && (
            <p className="text-xs text-white/65 leading-snug line-clamp-1">
              {world.description}
            </p>
          )}

          <div className="flex flex-col gap-1 max-w-[220px]">
            <div className="flex justify-between text-[10px] text-white/45">
              <span>{world.completedExercises} de {world.totalExercises} ejercicios</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: scheme.accentColor }}
              />
            </div>
          </div>
        </div>

        <span
          className="shrink-0 ml-4 px-5 py-1.5 rounded-full text-base text-white whitespace-nowrap self-end"
          style={{
            fontFamily: "var(--font-caveat)",
            fontWeight: 700,
            letterSpacing: "0.03em",
            background: "rgba(255,255,255,0.15)",
            border: `1.5px solid rgba(255,255,255,0.40)`,
            backdropFilter: "blur(6px)",
            boxShadow: `0 2px 12px ${scheme.particles}30`,
          }}
        >
          Empezar →
        </span>
      </div>
    </Link>
  );
}

export function WorldsGrid({ worlds }: { worlds: WorldData[] }) {
  const { setTheme } = useWorldTheme();

  useEffect(() => {
    if (worlds.length === 0) return;
    const scheme = getScheme(worlds[0].name);
    setTheme({
      navGradient: scheme.navGradient,
      accentColor: scheme.accentColor,
      buttonGradient: scheme.buttonGradient,
    });
  }, [worlds]);

  if (worlds.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No hay mundos disponibles todavia.
      </p>
    );
  }

  return (
    <>
      <FloatingParticles />

      <div className="flex flex-col gap-3 px-4 max-w-2xl mx-auto pb-32">
        {worlds.map((world, index) => (
          <WorldCard key={world.id} world={world} index={index} />
        ))}
      </div>
    </>
  );
}
