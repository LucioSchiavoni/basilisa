export type WorldConfig = {
  id: string
  name: string
  displayName: string
  backgroundColor: string
  characterImage: string
  accentColor: string
}

export const WORLDS: Record<string, WorldConfig> = {
  medieval: {
    id: "medieval",
    name: "medieval",
    displayName: "Mundo Medieval",
    backgroundColor: "linear-gradient(to bottom, #1a0a2e, #2d1b4e, #0d0820)",
    characterImage: "/pj/medieval-pj.png",
    accentColor: "#d4af37",
  },
  bosque: {
    id: "bosque",
    name: "bosque",
    displayName: "Mundo Bosque",
    backgroundColor: "linear-gradient(to bottom, #071a07, #0d2e12, #051209)",
    characterImage: "/pj/aligator-pj.png",
    accentColor: "#10b981",
  },
  agua: {
    id: "agua",
    name: "agua",
    displayName: "Mundo Agua",
    backgroundColor: "linear-gradient(to bottom, #020b2a, #041e4a, #051b3a)",
    characterImage: "/pj/octopus-pj.png",
    accentColor: "#06b6d4",
  },
  fuego: {
    id: "fuego",
    name: "fuego",
    displayName: "Mundo Fuego",
    backgroundColor: "linear-gradient(to bottom, #1a0500, #3a0c00, #1f0800)",
    characterImage: "/pj/phoenix.png",
    accentColor: "#f97316",
  },
  hielo: {
    id: "hielo",
    name: "hielo",
    displayName: "Mundo Hielo",
    backgroundColor: "linear-gradient(to bottom, #b8d4e8, #daeaf5, #f0f8ff)",
    characterImage: "/pj/penguin-pj.png",
    accentColor: "#7dd3fc",
  },
  cielo: {
    id: "cielo",
    name: "cielo",
    displayName: "Mundo Cielo",
    backgroundColor: "linear-gradient(to bottom, #87ceeb, #9b8ec4, #6a5acd)",
    characterImage: "/pj/dragon-pj.png",
    accentColor: "#38bdf8",
  },
}

const DIFFICULTY_TO_WORLD: Record<number, string> = {
  1: "medieval",
  2: "agua",
  3: "bosque",
  4: "hielo",
  5: "fuego",
  6: "cielo",
}

export function getWorldByDifficulty(difficultyLevel: number): string | null {
  return DIFFICULTY_TO_WORLD[difficultyLevel] ?? null
}

export function getWorldConfig(worldId: string): WorldConfig | null {
  return WORLDS[worldId] ?? null
}

export function getWorldBackground(worldId: string): string {
  return WORLDS[worldId]?.backgroundColor ?? ""
}
