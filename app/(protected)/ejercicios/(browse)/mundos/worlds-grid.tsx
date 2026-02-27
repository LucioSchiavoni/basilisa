"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getScheme } from "./world-color-schemes";
import { WorldCanvas } from "./world-canvas";
import { useWorldTheme } from "@/components/world-theme-context";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

const CONTAINER_W = 320;
const NODE_X_LEFT = 76;
const NODE_X_RIGHT = CONTAINER_W - 76;
const PATH_TOP = 130;
const NODE_SPACING_Y = 220;
const PATH_BOTTOM = 130;

const SCALE_ACTIVE = 1.38;
const SCALE_NORMAL = 1.0;

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
  const { setTheme } = useWorldTheme();
  const scaleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

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
    if (worlds.length === 0 || !containerRef.current) return;

    const els = scaleRefs.current.slice(0, worlds.length);

    gsap.set(els[0], { scale: SCALE_ACTIVE });
    if (els.length > 1) gsap.set(els.slice(1), { scale: SCALE_NORMAL });

    if (worlds.length === 1) return;

    const endOffset = PATH_TOP + (worlds.length - 1) * NODE_SPACING_Y;

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: `top+=${PATH_TOP} center`,
      end: `top+=${endOffset} center`,
      scrub: 0.6,
      onUpdate(self) {
        const activeFloat = self.progress * (worlds.length - 1);
        els.forEach((el, i) => {
          if (!el) return;
          const dist = Math.abs(i - activeFloat);
          const scale =
            dist < 1
              ? SCALE_NORMAL + (SCALE_ACTIVE - SCALE_NORMAL) * (1 - dist)
              : SCALE_NORMAL;
          gsap.set(el, { scale });
        });
      },
    });

    return () => {
      st.kill();
      gsap.killTweensOf(els.filter(Boolean));
    };
  }, [worlds.length]);

  if (worlds.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No hay mundos disponibles todavia.
      </p>
    );
  }

  const containerHeight =
    PATH_TOP + (worlds.length - 1) * NODE_SPACING_Y + PATH_BOTTOM;
  const pathD = buildSvgPath(worlds.length);
  const currentWorldName = worlds[bgIndex]?.name ?? "";
  const currentScheme = getScheme(currentWorldName);

  return (
    <>
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 130% 90% at 50% 45%, #fdf9f4 0%, #faf3ea 50%, #f6ece0 100%)",
        }}
      />
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 18% 78%, rgba(251,222,200,0.35) 0%, transparent 52%), radial-gradient(circle at 82% 18%, rgba(248,216,190,0.28) 0%, transparent 48%), radial-gradient(circle at 55% 90%, rgba(253,230,210,0.22) 0%, transparent 40%)",
        }}
      />

      <WorldCanvas worldName={currentWorldName} isActive={true} />

      <div className="flex justify-center">
        <div
          ref={containerRef}
          className="relative"
          style={{ width: CONTAINER_W, height: containerHeight, overflow: "visible" }}
        >
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
                className="absolute"
                style={{
                  left: pos.x,
                  top: pos.y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  ref={(el) => {
                    scaleRefs.current[index] = el;
                  }}
                  className="flex flex-col items-center gap-2"
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
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
