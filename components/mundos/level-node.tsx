"use client"

import Image from "next/image"
import Link from "next/link"

const STROKE = 4
const IMG = 108
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
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            <circle
              cx={C}
              cy={C}
              r={R}
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={STROKE}
            />
            {progress > 0 && (
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
            )}
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

        {difficultyLabel && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: -10,
              fontSize: 10,
              fontWeight: 600,
              fontFamily: "var(--font-lexend)",
              padding: "2px 7px",
              borderRadius: 9999,
              background: accentColor,
              color: "#0B1926",
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
