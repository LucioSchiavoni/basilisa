"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getScheme, DEFAULT_SCHEME } from "./world-color-schemes";
import { WorldCanvas } from "./world-canvas";
import { useWorldTheme } from "@/components/world-theme-context";

type WorldData = {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  iconUrl: string | null;
  difficultyLevel: number;
  difficultyLabel: string | null;
  therapeuticDescription: string | null;
  totalExercises: number;
  completedExercises: number;
};

const CONTAINER_W = 320;
const NODE_X_LEFT = 76;
const NODE_X_RIGHT = CONTAINER_W - 76;
const PATH_TOP = 130;
const NODE_SPACING_Y = 220;
const PATH_BOTTOM = 130;

function getNodePos(index: number) {
  return {
    x: index % 2 === 0 ? NODE_X_LEFT : NODE_X_RIGHT,
    y: PATH_TOP + index * NODE_SPACING_Y,
  };
}

function buildSvgPath(count: number): string {
  if (count === 0) return "";
  if (count === 1) {
    const p = getNodePos(0);
    return `M ${p.x} ${p.y}`;
  }
  const pts = Array.from({ length: count }, (_, i) => getNodePos(i));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const cy = (p0.y + p1.y) / 2;
    d += ` C ${p0.x} ${cy} ${p1.x} ${cy} ${p1.x} ${p1.y}`;
  }
  return d;
}

export function WorldsGrid({ worlds }: { worlds: WorldData[] }) {
  const [bgIndex, setBgIndex] = useState(0);
  const bgRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (worlds.length === 0) return;
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % worlds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [worlds.length]);

  useEffect(() => {
    if (!bgRef.current || worlds.length === 0) return;
    const scheme = getScheme(worlds[bgIndex]?.name ?? "");
    const bgValue = scheme.background.startsWith("/")
      ? `url(${scheme.background}) center/cover no-repeat`
      : scheme.background;
    const el = bgRef.current;
    el.style.opacity = "0";
    const timer = setTimeout(() => {
      if (!bgRef.current) return;
      el.style.background = bgValue;
      el.style.opacity = "1";
    }, 350);
    return () => {
      clearTimeout(timer);
      if (bgRef.current) bgRef.current.style.opacity = "1";
    };
  }, [bgIndex, worlds]);

  if (worlds.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No hay mundos disponibles todavia.
      </p>
    );
  }

  const containerHeight = PATH_TOP + (worlds.length - 1) * NODE_SPACING_Y + PATH_BOTTOM;
  const pathD = buildSvgPath(worlds.length);
  const currentWorldName = worlds[bgIndex]?.name ?? "";
  const currentScheme = getScheme(currentWorldName);

  return (
    <>
      <div
        ref={bgRef}
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ background: DEFAULT_SCHEME.background, transition: "opacity 0.35s ease-in" }}
      />

      <WorldCanvas worldName={currentWorldName} isActive={true} />

      <div className="flex justify-center">
        <div className="relative" style={{ width: CONTAINER_W, height: containerHeight }}>
          <svg
            className="absolute inset-0 pointer-events-none"
            width={CONTAINER_W}
            height={containerHeight}
          >
            <path
              d={pathD}
              fill="none"
              stroke={currentScheme.particles}
              strokeWidth={14}
              strokeOpacity={0.18}
              strokeLinecap="round"
            />
            <path
              d={pathD}
              fill="none"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeDasharray="14 10"
            />
          </svg>

          {worlds.map((world, index) => {
            const scheme = getScheme(world.name);
            const pos = getNodePos(index);
            return (
              <div
                key={world.id}
                className="absolute flex flex-col items-center gap-2"
                style={{
                  left: pos.x,
                  top: pos.y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="relative">
                  <div
                    className="absolute -inset-4 rounded-full -z-10 blur-xl"
                    style={{ background: `${scheme.particles}40` }}
                  />
                  <Link
                    href={`/ejercicios/mundos/${world.id}`}
                    className="relative block w-[88px] h-[88px] transition-transform duration-200 active:scale-95 hover:scale-105"
                  >
                    {world.iconUrl && (
                      <Image
                        src={world.iconUrl}
                        alt={world.displayName}
                        fill
                        className="object-contain drop-shadow-2xl"
                        sizes="88px"
                      />
                    )}
                  </Link>
                </div>

                <h2
                  className="text-xs font-extrabold text-white text-center leading-tight"
                  style={{
                    maxWidth: 100,
                    textShadow: "0 1px 6px rgba(0,0,0,0.9)",
                  }}
                >
                  {world.displayName}
                </h2>

                {world.difficultyLabel && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      color: scheme.particles,
                      textShadow: "0 0 8px rgba(0,0,0,1)",
                    }}
                  >
                    {world.difficultyLabel}
                  </span>
                )}

                <Link
                  href={`/ejercicios/mundos/${world.id}`}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all duration-200 active:scale-95 shadow-lg"
                  style={{
                    background: scheme.buttonGradient,
                    boxShadow: `0 2px 10px ${scheme.particles}50`,
                  }}
                >
                  Empezar
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
