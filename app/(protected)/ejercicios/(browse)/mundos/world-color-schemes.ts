export type WorldColorScheme = {
  background: string;
  playerBackground: string;
  particles: string;
  glow: string;
  navGradient: string;
  accentColor: string;
  accentFg: string;
  buttonGradient: string;
  worldImage: string;
  characterImage: string;
};

export const WORLD_COLOR_SCHEMES: Record<string, WorldColorScheme> = {
  medieval: {
    background: "/bg/medieval-bg.jpeg",
    playerBackground: "linear-gradient(to bottom, #1a0a2e, #2d1b4e, #0d0820)",
    particles: "#f5c842",
    glow: "rgba(245, 200, 66, 0.40)",
    navGradient: "linear-gradient(135deg, rgba(20,83,45,0.90) 0%, rgba(5,46,22,0.96) 100%)",
    accentColor: "#d4af37",
    accentFg: "#1e293b",
    buttonGradient: "linear-gradient(135deg, #166534 0%, #14532d 100%)",
    worldImage: "/mundos/medieval.png",
    characterImage: "/pj/medieval-pj.png",
  },
  bosque: {
    background: "/bg/bosque-bg.jpeg",
    playerBackground: "linear-gradient(to bottom, #071a07, #0d2e12, #051209)",
    particles: "#4ade80",
    glow: "rgba(74, 222, 128, 0.30)",
    navGradient: "linear-gradient(135deg, rgba(5,46,22,0.90) 0%, rgba(2,25,12,0.96) 100%)",
    accentColor: "#10b981",
    accentFg: "#1e293b",
    buttonGradient: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    worldImage: "/mundos/bosque.png",
    characterImage: "/pj/bosque-pj.png",
  },
  agua: {
    background: "/bg/bg-agua.jpeg",
    playerBackground: "linear-gradient(to bottom, #020b2a, #041e4a, #051b3a)",
    particles: "#22d3ee",
    glow: "rgba(34, 211, 238, 0.34)",
    navGradient: "linear-gradient(135deg, rgba(3,22,52,0.90) 0%, rgba(1,10,30,0.96) 100%)",
    accentColor: "#06b6d4",
    accentFg: "#1e293b",
    buttonGradient: "linear-gradient(135deg, #0e7490 0%, #0c4a6e 100%)",
    worldImage: "/mundos/oceano.png",
    characterImage: "/pj/oceano-pj.png",
  },
  hielo: {
    background: "/bg/hielo-bg.jpeg",
    playerBackground: "linear-gradient(to bottom, #b8d4e8, #daeaf5, #f0f8ff)",
    particles: "#a5f3fc",
    glow: "rgba(139, 92, 246, 0.32)",
    navGradient: "linear-gradient(135deg, rgba(10,20,40,0.90) 0%, rgba(5,12,28,0.96) 100%)",
    accentColor: "#7dd3fc",
    accentFg: "#1e293b",
    buttonGradient: "linear-gradient(135deg, #0891b2 0%, #164e63 100%)",
    worldImage: "/mundos/hielo.png",
    characterImage: "/pj/hielo-pj.png",
  },
  fuego: {
    background: "/bg/fuego-bg.jpeg",
    playerBackground: "linear-gradient(to bottom, #1a0500, #3a0c00, #1f0800)",
    particles: "#ef4444",
    glow: "rgba(239, 68, 68, 0.42)",
    navGradient: "linear-gradient(135deg, rgba(35,6,3,0.90) 0%, rgba(20,3,1,0.96) 100%)",
    accentColor: "#f97316",
    accentFg: "#1e293b",
    buttonGradient: "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)",
    worldImage: "/mundos/fuego.png",
    characterImage: "/pj/fuego-pj.png",
  },
  cielo: {
    background: "/bg/cielo-bg.jpeg",
    playerBackground: "linear-gradient(to bottom, #87ceeb, #9b8ec4, #6a5acd)",
    particles: "#7dd3fc",
    glow: "rgba(125, 211, 252, 0.40)",
    navGradient: "linear-gradient(135deg, rgba(15,8,40,0.90) 0%, rgba(8,4,24,0.96) 100%)",
    accentColor: "#38bdf8",
    accentFg: "#1e293b",
    buttonGradient: "linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)",
    worldImage: "/mundos/cielo.png",
    characterImage: "/pj/cielo-pj.png",
  },
};

export const DEFAULT_SCHEME: WorldColorScheme = {
  background: "linear-gradient(to bottom, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
  playerBackground: "linear-gradient(to bottom, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
  particles: "#2E85C8",
  glow: "rgba(46, 133, 200, 0.30)",
  navGradient: "linear-gradient(135deg, rgba(20,55,90,0.92) 0%, rgba(12,35,60,0.97) 100%)",
  accentColor: "#2E85C8",
  accentFg: "#1e293b",
  buttonGradient: "linear-gradient(135deg, #2E85C8 0%, #1a5a8a 100%)",
  worldImage: "",
  characterImage: "",
};

export function getScheme(name: string): WorldColorScheme {
  return WORLD_COLOR_SCHEMES[name] ?? DEFAULT_SCHEME;
}
