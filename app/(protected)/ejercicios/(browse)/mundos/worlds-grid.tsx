"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
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

export function WorldsGrid({ worlds }: { worlds: WorldData[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const bgRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const currentWorld = worlds[currentIndex];
  const currentScheme = getScheme(currentWorld?.name ?? "");
  const { setTheme } = useWorldTheme();

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(worlds.length - 1, index));
    setCurrentIndex(clamped);
  };

  useEffect(() => {
    if (!bgRef.current || worlds.length === 0) return;
    const scheme = getScheme(worlds[currentIndex].name);
    setTheme({
      navGradient: scheme.navGradient,
      accentColor: scheme.accentColor,
      buttonGradient: scheme.buttonGradient,
    });
    const bgValue = scheme.background.startsWith("/")
      ? `url(${scheme.background}) center/cover no-repeat`
      : scheme.background;
    gsap.to(bgRef.current, {
      opacity: 0,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => {
        if (!bgRef.current) return;
        bgRef.current.style.background = bgValue;
        gsap.to(bgRef.current, { opacity: 1, duration: 0.7, ease: "power2.out" });
      },
    });

  }, [currentIndex, worlds]);

  useEffect(() => {
    if (!sliderRef.current) return;
    gsap.to(sliderRef.current, {
      x: `-${currentIndex * 100}vw`,
      duration: 0.7,
      ease: "power3.inOut",
    });
  }, [currentIndex]);

  if (worlds.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No hay mundos disponibles todavia.
      </p>
    );
  }

  return (
    <>
      <div
        ref={bgRef}
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ background: DEFAULT_SCHEME.background }}
      />

      <WorldCanvas worldName={currentWorld?.name ?? ""} isActive={true} />

      <div className="fixed inset-0 overflow-hidden">
        <div
          ref={sliderRef}
          className="flex h-full will-change-transform"
          style={{ width: `${worlds.length * 100}vw` }}
        >
          {worlds.map((world, index) => {
            const scheme = getScheme(world.name);
            const floatDuration = 2.6 + (index % 4) * 0.45;
            const floatDelay = (index % 3) * 0.35;
            const islandContent = (
              <>
                <div
                  className="absolute -inset-12 md:-inset-16 lg:-inset-24 rounded-full -z-10 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at center, ${scheme.particles} 0%, transparent 65%)`,
                    filter: "blur(32px)",
                    opacity: 0.6,
                  }}
                />
                {world.iconUrl && (
                  <Image
                    src={world.iconUrl}
                    alt={world.displayName}
                    fill
                    className="object-contain drop-shadow-2xl transition-all duration-500"
                    sizes="(min-width: 1024px) 480px, (min-width: 768px) 340px, 256px"
                  />
                )}
              </>
            );

            return (
              <div
                key={world.id}
                className="flex-shrink-0 w-screen h-full flex flex-col items-center justify-center pt-0"
              >
                <div className="flex flex-col items-center gap-3 md:gap-4">
                  <h2
                    className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight text-center"
                    style={{
                      textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.7), 0 0 30px rgba(0,0,0,0.5)",
                      WebkitTextStroke: "0.5px rgba(255,255,255,0.15)",
                    }}
                  >
                    {world.displayName}
                  </h2>

                  <div
                    className="relative w-60 h-60 md:w-[320px] md:h-[320px] lg:w-[460px] lg:h-[460px]"
                    style={{
                      animation: `worldFloat ${floatDuration}s ease-in-out ${floatDelay}s infinite`,
                    }}
                  >
                    <Link
                      href={`/ejercicios/mundos/${world.id}`}
                      className="relative block w-full h-full transition-transform duration-200 active:scale-95 hover:scale-[1.03]"
                    >
                      {islandContent}
                    </Link>
                  </div>

                  {world.difficultyLabel && (
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{
                        color: scheme.particles,
                        textShadow: "0 0 8px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,1), 0 2px 10px rgba(0,0,0,0.9)",
                      }}
                    >
                      {world.difficultyLabel}
                    </span>
                  )}

                  {world.therapeuticDescription && (
                    <p className="text-sm font-semibold text-white text-center leading-[1.9] w-[280px] md:w-[360px]">
                      <span
                        style={{
                          background: "rgba(0,0,0,0.52)",
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                          borderRadius: "6px",
                          padding: "2px 8px",
                          boxDecorationBreak: "clone",
                          WebkitBoxDecorationBreak: "clone",
                          textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                        } as React.CSSProperties}
                      >
                        {world.therapeuticDescription}
                      </span>
                    </p>
                  )}

                  <Link
                    href={`/ejercicios/mundos/${world.id}`}
                    className="w-[200px] md:w-[240px] text-center px-6 py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-lg"
                    style={{
                      background: scheme.buttonGradient,
                      boxShadow: `0 4px 16px ${scheme.particles}40`,
                    }}
                  >
                    <span
                      className="text-sm font-bold text-white"
                      style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
                    >
                      Empezar
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {currentIndex > 0 && (
          <button
            onClick={() => goTo(currentIndex - 1)}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-100 active:translate-y-[2px]"
            style={{
              background: "rgba(0,0,0,0.65)",
              border: `2px solid ${currentScheme.particles}60`,
              boxShadow: `0 4px 0 rgba(0,0,0,0.6), 0 0 12px ${currentScheme.particles}30`,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3 L5 8 L10 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {currentIndex < worlds.length - 1 && (
          <button
            onClick={() => goTo(currentIndex + 1)}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-100 active:translate-y-[2px]"
            style={{
              background: "rgba(0,0,0,0.65)",
              border: `2px solid ${currentScheme.particles}60`,
              boxShadow: `0 4px 0 rgba(0,0,0,0.6), 0 0 12px ${currentScheme.particles}30`,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3 L11 8 L6 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
}
