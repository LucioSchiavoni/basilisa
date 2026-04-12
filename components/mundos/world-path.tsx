"use client"

import { LevelNode } from "./level-node"
import { getScheme } from "@/app/(protected)/ejercicios/(browse)/mundos/world-color-schemes"

type WorldData = {
  id: string
  name: string
  displayName: string
  difficultyLevel: number
  totalExercises: number
  completedExercises: number
}

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Principiante",
  2: "Fácil",
  3: "Intermedio",
  4: "Avanzado",
  5: "Difícil",
  6: "Experto",
}

const ZIG_ZAG_MOBILE = [76, 18, 80, 14, 76, 18]
const ZIG_ZAG = [80, 12, 84, 8, 80, 12]

function buildRoadPath(pts: [number, number][], curve = 8): string {
  if (pts.length < 2) return ""
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[i + 1]
    d += ` C ${x1} ${y1 + curve}, ${x2} ${y2 - curve}, ${x2} ${y2}`
  }
  return d
}

const PATH_LAYERS = (d: string) => (
  <>
    <path d={d} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke="#c8a96e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke="rgba(255,245,220,0.45)" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
  </>
)

const MOBILE_SLOT = 220
const MOBILE_TOP = 20

export function WorldPath({ worlds }: { worlds: WorldData[] }) {
  const n = worlds.length

  const mobileContainerH = MOBILE_TOP + n * MOBILE_SLOT
  const mobilePoints: [number, number][] = worlds.map((_, i) => [
    ZIG_ZAG_MOBILE[i] ?? 50,
    ((MOBILE_TOP + i * MOBILE_SLOT + MOBILE_SLOT / 2) / mobileContainerH) * 100,
  ])

  const desktopPoints: [number, number][] = worlds.map((_, i) => [
    ZIG_ZAG[i] ?? 50,
    n === 1 ? 50 : 18 + (i / (n - 1)) * 72,
  ])

  const mobilePath = buildRoadPath(mobilePoints, 18)
  const desktopPath = buildRoadPath(desktopPoints, 18)

  const renderNodes = (points: [number, number][]) =>
    worlds.map((world, index) => {
      const scheme = getScheme(world.name)
      const difficultyLabel = DIFFICULTY_LABELS[world.difficultyLevel] ?? "Nivel " + world.difficultyLevel
      const [xPos, yPos] = points[index]
      return (
        <div
          key={world.id}
          style={{
            position: "absolute",
            left: `${xPos}%`,
            top: `${yPos}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <LevelNode
            name={world.displayName}
            imageUrl={scheme.worldImage}
            href={`/ejercicios/mundos/${world.id}`}
            completedExercises={world.completedExercises}
            totalExercises={world.totalExercises}
            accentColor={scheme.accentColor}
            difficultyLabel={difficultyLabel}
            bgColor="#ffffff"
            hideName
          />
        </div>
      )
    })

  return (
    <>
      {/* Mobile: vertical scrollable */}
      <div
        className="relative w-full lg:hidden"
        style={{ height: mobileContainerH }}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {PATH_LAYERS(mobilePath)}
        </svg>
        {renderNodes(mobilePoints)}
      </div>

      {/* Desktop: all worlds in viewport */}
      <div
        className="relative w-full hidden lg:block"
        style={{ height: "calc(100dvh - 220px)", minHeight: 520 }}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {PATH_LAYERS(desktopPath)}
        </svg>
        {renderNodes(desktopPoints)}
      </div>
    </>
  )
}
