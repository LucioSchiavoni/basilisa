"use client"

import Image from "next/image"
import Link from "next/link"

const STROKE = 4
const IMG = 140
const DEPTH = 10
const SVG_SIZE = IMG + STROKE * 2
const R = IMG / 2 + STROKE / 2
const C = SVG_SIZE / 2
const CIRC = 2 * Math.PI * R
const CONTAINER_H = STROKE + IMG + DEPTH

interface LevelNodeProps {
  name: string
  imageUrl: string
  href: string
  completedExercises?: number
  totalExercises?: number
  accentColor?: string
  difficultyLabel?: string
  nameAbove?: boolean
  nameSide?: "left" | "right"
  hideName?: boolean
  bgColor?: string
}

export function LevelNode({
  name,
  imageUrl,
  href,
  completedExercises = 0,
  totalExercises = 0,
  accentColor = "#22d3ee",
  difficultyLabel,
  nameAbove = false,
  nameSide,
  hideName = false,
  bgColor = "transparent",
}: LevelNodeProps) {
  const progress = totalExercises > 0 ? completedExercises / totalExercises : 0
  const dashOffset = CIRC * (1 - progress)
  const isCompleted = progress >= 1
  const filterId = `glow-${name.replace(/\s+/g, "-")}`

  return (
    <Link
      href={href}
      className={`group relative transition-transform duration-200 ease-out hover:scale-110 active:scale-95 ${nameSide ? "flex flex-row items-center gap-3" : "flex flex-col items-center"}`}
    >
      {!hideName && nameAbove && !nameSide && (
        <p
          className="mb-2 font-bold text-center leading-tight text-foreground"
          style={{ fontSize: 18, width: 160, fontFamily: "var(--font-lexend)" }}
        >
          {name}
        </p>
      )}
      {!hideName && nameSide === "left" && (
        <p
          className="font-bold leading-tight text-foreground text-right"
          style={{ fontSize: 15, width: 100, fontFamily: "var(--font-lexend)" }}
        >
          {name}
        </p>
      )}
      <div style={{ position: "relative", width: SVG_SIZE, height: CONTAINER_H }}>
        <div
          style={{
            position: "absolute",
            top: STROKE + DEPTH,
            left: STROKE,
            width: IMG,
            height: IMG,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.55)",
          }}
        />

        <div
          className="transition-transform duration-150 ease-in-out group-hover:[transform:translateY(4px)] group-active:[transform:translateY(10px)]"
          style={{ position: "absolute", top: 0, left: 0, width: SVG_SIZE, height: SVG_SIZE }}
        >
          <svg
            width={SVG_SIZE}
            height={SVG_SIZE}
            style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
          >
            {isCompleted && (
              <defs>
                <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            )}

            <circle
              cx={C}
              cy={C}
              r={R}
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={STROKE}
            />

            {isCompleted ? (
              <>
                <circle
                  cx={C}
                  cy={C}
                  r={R}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={STROKE + 1}
                  filter={`url(#${filterId})`}
                />
                <circle
                  cx={C}
                  cy={C}
                  r={R + 8}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={2}
                  opacity={0.85}
                />
              </>
            ) : progress > 0 ? (
              <circle
                cx={C}
                cy={C}
                r={R}
                fill="none"
                stroke={accentColor}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90, ${C}, ${C})`}
              />
            ) : null}
          </svg>

          <div
            style={{
              position: "absolute",
              top: STROKE,
              left: STROKE,
              width: IMG,
              height: IMG,
              borderRadius: "50%",
              overflow: "hidden",
              background: bgColor,
            }}
          >
            <Image src={imageUrl} alt={name} fill className="object-cover" />
          </div>
        </div>

        {isCompleted && (
          <div
            style={{
              position: "absolute",
              bottom: DEPTH - 4,
              left: "50%",
              transform: "translateX(-50%)",
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: accentColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 2px 8px ${accentColor}88`,
              border: "2px solid white",
              zIndex: 10,
            }}
          >
            <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
              <path
                d="M1.5 5L4.5 8L11.5 1"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {difficultyLabel && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: -10,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "var(--font-lexend)",
              padding: "2px 7px",
              borderRadius: 9999,
              background: accentColor,
              color: "#ffffff",
              whiteSpace: "nowrap",
              lineHeight: 1.4,
              boxShadow: `0 2px 6px ${accentColor}66`,
            }}
          >
            {difficultyLabel}
          </span>
        )}
      </div>

      {!hideName && nameSide === "right" && (
        <p
          className="font-bold leading-tight text-foreground text-left"
          style={{ fontSize: 15, width: 100, fontFamily: "var(--font-lexend)" }}
        >
          {name}
        </p>
      )}
      {!hideName && !nameAbove && !nameSide && (
        <p
          className="mt-3 font-bold text-center leading-tight text-foreground"
          style={{ fontSize: 18, width: 160, fontFamily: "var(--font-lexend)" }}
        >
          {name}
        </p>
      )}
    </Link>
  )
}
