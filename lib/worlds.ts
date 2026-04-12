import { getScheme, WorldColorScheme } from "@/app/(protected)/ejercicios/(browse)/mundos/world-color-schemes"

export type WorldConfig = WorldColorScheme & { displayName: string }

const DISPLAY_NAMES: Record<string, string> = {
  medieval: "Mundo Medieval",
  bosque:   "Mundo Bosque",
  agua:     "Mundo Agua",
  fuego:    "Mundo Fuego",
  hielo:    "Mundo Hielo",
  cielo:    "Mundo Cielo",
}

const DIFFICULTY_TO_WORLD: Record<number, string> = {
  1: "medieval",
  2: "agua",
  3: "bosque",
  4: "hielo",
  5: "fuego",
  6: "cielo",
}

export const WORLDS: Record<string, WorldConfig> = Object.fromEntries(
  Object.entries(DISPLAY_NAMES).map(([name, displayName]) => [
    name,
    { ...getScheme(name), displayName },
  ])
)

export function getWorldByDifficulty(difficultyLevel: number): string | null {
  return DIFFICULTY_TO_WORLD[difficultyLevel] ?? null
}

export function getWorldConfig(worldId: string): WorldConfig | null {
  const displayName = DISPLAY_NAMES[worldId]
  if (!displayName) return null
  return { ...getScheme(worldId), displayName }
}

export function getWorldBackground(worldId: string): string {
  return getScheme(worldId).playerBackground
}
