"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { WorldPath } from "@/components/mundos/world-path"

const WORLD_IMAGE: Record<string, string> = {
  medieval: "/mundos/medieval.png",
  agua:     "/mundos/oceano.png",
  bosque:   "/mundos/bosque.png",
  hielo:    "/mundos/hielo.png",
  fuego:    "/mundos/fuego.png",
  cielo:    "/mundos/cielo.png",
}

const WORLD_COLOR: Record<string, string> = {
  medieval: "#B8832A",
  agua:     "#1478A0",
  bosque:   "#2D7A4E",
  hielo:    "#41B0C4",
  fuego:    "#C04A28",
  cielo:    "#6044B0",
}

type WorldData = {
  id: string
  name: string
  displayName: string
  difficultyLevel: number
  totalExercises: number
  completedExercises: number
  description?: string
}

export function WorldGrid({ worlds, userName }: { worlds: WorldData[]; userName?: string }) {
  const [view, setView] = useState<"grid" | "path">("path")

  return (
    <div className="flex flex-col gap-5">

      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          {userName && (
            <p
              className="text-xs uppercase tracking-widest"
              style={{ fontFamily: "var(--font-lexend)", fontWeight: 500, color: "var(--muted-foreground, #aaa)" }}
            >
              Bienvenido
            </p>
          )}
          <p
            className="text-xl lg:text-2xl leading-tight"
            style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, color: "var(--foreground, #111)" }}
          >
            {userName ? userName : "¿A qué mundo vas hoy?"}
          </p>
          {userName && (
            <p
              className="text-xs uppercase tracking-widest"
              style={{ fontFamily: "var(--font-lexend)", fontWeight: 500, color: "var(--muted-foreground, #aaa)" }}
            >
              Elegí un mundo para comenzar a practicar
            </p>
          )}
        </div>

        <div
          className="flex items-center gap-0.5 p-1 rounded-xl shrink-0"
          style={{ background: "var(--muted, #f1f1f1)" }}
        >
          <button
            onClick={() => setView("grid")}
            className="flex items-center justify-center w-8 h-7 rounded-lg transition-all duration-200"
            style={{
              background: view === "grid" ? "#ffffff" : "transparent",
              boxShadow: view === "grid" ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1.2" fill={view === "grid" ? "#111" : "#aaa"} />
              <rect x="8" y="1" width="5" height="5" rx="1.2" fill={view === "grid" ? "#111" : "#aaa"} />
              <rect x="1" y="8" width="5" height="5" rx="1.2" fill={view === "grid" ? "#111" : "#aaa"} />
              <rect x="8" y="8" width="5" height="5" rx="1.2" fill={view === "grid" ? "#111" : "#aaa"} />
            </svg>
          </button>
          <button
            onClick={() => setView("path")}
            className="flex items-center justify-center w-8 h-7 rounded-lg transition-all duration-200"
            style={{
              background: view === "path" ? "#ffffff" : "transparent",
              boxShadow: view === "path" ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 12 C3 12 5 9 7 7 C9 5 11 3 11 3" stroke={view === "path" ? "#111" : "#aaa"} strokeWidth="2" strokeLinecap="round" />
              <circle cx="3" cy="12" r="1.5" fill={view === "path" ? "#111" : "#aaa"} />
              <circle cx="11" cy="2.5" r="1.5" fill={view === "path" ? "#111" : "#aaa"} />
            </svg>
          </button>
        </div>
      </div>

      {view === "path" ? (
        <WorldPath worlds={worlds} />
      ) : (
        <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-3 lg:grid-cols-3 lg:gap-4">
          {worlds.map((world) => {
            const color = WORLD_COLOR[world.name] ?? "#4A6080"
            const mundoSrc = WORLD_IMAGE[world.name]
            const completed = world.completedExercises
            const total = world.totalExercises
            const isDone = total > 0 && completed >= total

            const mobileProgressBadge = (
              <div
                className="inline-flex items-center gap-1.5 rounded-xl self-start"
                style={{ background: color, padding: "5px 12px", boxShadow: `0 2px 6px ${color}44` }}
              >
                <span
                  className="text-[12px] leading-none whitespace-nowrap"
                  style={{ fontFamily: "var(--font-lexend)", fontWeight: 500, color: "#ffffff" }}
                >
                  Progreso
                </span>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-px shrink-0" style={{ background: "rgba(255,255,255,0.4)" }} />
                  <span
                    className="text-[10px] tabular-nums leading-none font-semibold whitespace-nowrap"
                    style={{ fontFamily: "var(--font-lexend)", color: "#ffffff" }}
                  >
                    {completed}/{total}
                  </span>
                  {isDone && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "rgba(255,255,255,0.25)", boxShadow: `0 1px 4px ${color}88` }}
                    >
                      <svg width="11" height="11" viewBox="0 0 9 9" fill="none">
                        <path d="M2 4.5L3.8 6.5L7 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            )

            const progressBadge = (
              <div
                className="inline-flex items-center gap-1.5 rounded-xl self-start"
                style={{ background: color, padding: "5px 10px", boxShadow: `0 2px 6px ${color}44` }}
              >
                <span
                  className="text-[12px] leading-none whitespace-nowrap"
                  style={{ fontFamily: "var(--font-lexend)", fontWeight: 500, color: "#ffffff" }}
                >
                  Progreso
                </span>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-px shrink-0" style={{ background: "rgba(255,255,255,0.4)" }} />
                  <span
                    className="text-[10px] tabular-nums leading-none font-semibold whitespace-nowrap"
                    style={{ fontFamily: "var(--font-lexend)", color: "#ffffff" }}
                  >
                    {completed}/{total}
                  </span>
                  {isDone && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "rgba(255,255,255,0.25)", boxShadow: `0 1px 4px ${color}88` }}
                    >
                      <svg width="11" height="11" viewBox="0 0 9 9" fill="none">
                        <path d="M2 4.5L3.8 6.5L7 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            )

            return (
              <div key={world.id}>

                {/* Mobile: horizontal card */}
                <Link
                  href={`/ejercicios/mundos/${world.id}`}
                  className="md:hidden relative flex items-center gap-2 select-none active:scale-[0.98] transition-transform duration-150 overflow-hidden"
                  style={{
                    border: `2px solid ${color}`,
                    borderRadius: 16,
                    padding: "0 12px 0 0",
                    background: "#ffffff",
                  }}
                >
                  <div
                    className="absolute inset-y-0 right-0 z-10 pointer-events-none"
                    style={{
                      width: "60%",
                      background: `linear-gradient(to left, ${color}33 0%, transparent 100%)`,
                    }}
                  />

                  <div
                    className="shrink-0 self-stretch flex items-center justify-center overflow-hidden relative z-20"
                    style={{ width: 90, minHeight: 64, borderRadius: "14px 0 0 14px" }}
                  >
                    {mundoSrc && (
                      <Image
                        src={mundoSrc}
                        alt=""
                        width={90}
                        height={90}
                        className="object-contain scale-[1.7]"
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-1 flex-1 min-w-0 relative z-20 py-1.5 pl-2">
                    <p
                      className="leading-tight"
                      style={{ fontFamily: "var(--font-lexend)", fontWeight: 400, fontSize: 18, color: color }}
                    >
                      {world.displayName}
                    </p>
                    {mobileProgressBadge}
                  </div>

                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 relative z-20">
                    <path d="M6 4L10 8L6 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>

                {/* Desktop: vertical card */}
                <div className="hidden md:block group relative">

                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-[28px] -z-10 blur-2xl"
                    style={{ background: color, transform: "scale(0.88) translateY(10px)" }}
                  />

                  <Link
                    href={`/ejercicios/mundos/${world.id}`}
                    className="block select-none transition-transform duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1 active:scale-[0.97]"
                    style={{
                      borderRadius: 28,
                      border: `3px solid ${color}`,
                      boxShadow: `0 2px 12px rgba(0,0,0,0.08)`,
                      background: "#ffffff",
                    }}
                  >
                    <div
                      className="relative aspect-4/5"
                      style={{ borderRadius: 24, overflow: "hidden" }}
                    >
                      <div
                        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: color }}
                      />

                      {mundoSrc && (
                        <Image
                          src={mundoSrc}
                          alt=""
                          fill
                          className="object-contain scale-[1.15] transition-transform duration-300 group-hover:scale-[1.24] z-10"
                        />
                      )}

                      <div className="absolute inset-x-0 top-0 z-20 px-2.5 pt-2.5">
                        {progressBadge}
                      </div>

                      <div
                        className="absolute inset-x-0 bottom-0 z-10"
                        style={{ background: `linear-gradient(to top, ${color}f0 0%, ${color}22 60%, transparent 100%)`, height: "20%" }}
                      />

                      <div className="absolute inset-x-0 z-20 px-3 text-center" style={{ bottom: "18%" }}>
                        <p
                          className="leading-tight text-black group-hover:text-white transition-colors duration-300"
                          style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: 20 }}
                        >
                          {world.displayName}
                        </p>
                      </div>

                    </div>
                  </Link>
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
