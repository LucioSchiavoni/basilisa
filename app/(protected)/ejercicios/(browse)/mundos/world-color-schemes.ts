export type WorldColorScheme = {
  background: string;
  particles: string;
  glow: string;
  navGradient: string;
  accentColor: string;
  buttonGradient: string;
};

export const WORLD_COLOR_SCHEMES: Record<string, WorldColorScheme> = {
  medieval: {
    background: "/bg/medieval-bg.png",
    particles: "#f5c842",
    glow: "rgba(245, 200, 66, 0.40)",
    navGradient: "linear-gradient(135deg, rgba(20,83,45,0.90) 0%, rgba(5,46,22,0.96) 100%)",
    accentColor: "#f5c842",
    buttonGradient: "linear-gradient(135deg, #166534 0%, #14532d 100%)",
  },
  bosque: {
    background: "/bg/bosque-bg.png",
    particles: "#4ade80",
    glow: "rgba(74, 222, 128, 0.30)",
    navGradient: "linear-gradient(135deg, rgba(5,46,22,0.90) 0%, rgba(2,25,12,0.96) 100%)",
    accentColor: "#4ade80",
    buttonGradient: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
  },
  agua: {
    background: "/bg/bg-agua.png",
    particles: "#22d3ee",
    glow: "rgba(34, 211, 238, 0.34)",
    navGradient: "linear-gradient(135deg, rgba(3,22,52,0.90) 0%, rgba(1,10,30,0.96) 100%)",
    accentColor: "#22d3ee",
    buttonGradient: "linear-gradient(135deg, #0e7490 0%, #0c4a6e 100%)",
  },
  hielo: {
    background: "/bg/hielo-bg.png",
    particles: "#a5f3fc",
    glow: "rgba(139, 92, 246, 0.32)",
    navGradient: "linear-gradient(135deg, rgba(10,20,40,0.90) 0%, rgba(5,12,28,0.96) 100%)",
    accentColor: "#a5f3fc",
    buttonGradient: "linear-gradient(135deg, #0891b2 0%, #164e63 100%)",
  },
  fuego: {
    background: "/bg/fuego-bg.png",
    particles: "#ef4444",
    glow: "rgba(239, 68, 68, 0.42)",
    navGradient: "linear-gradient(135deg, rgba(35,6,3,0.90) 0%, rgba(20,3,1,0.96) 100%)",
    accentColor: "#ef4444",
    buttonGradient: "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)",
  },
  cielo: {
    background: "/bg/cielo-bg.png",
    particles: "#7dd3fc",
    glow: "rgba(125, 211, 252, 0.40)",
    navGradient: "linear-gradient(135deg, rgba(15,8,40,0.90) 0%, rgba(8,4,24,0.96) 100%)",
    accentColor: "#7dd3fc",
    buttonGradient: "linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)",
  },
};

export const DEFAULT_SCHEME: WorldColorScheme = {
  background:
    "linear-gradient(to bottom, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
  particles: "#2E85C8",
  glow: "rgba(46, 133, 200, 0.30)",
  navGradient: "linear-gradient(135deg, rgba(20,55,90,0.92) 0%, rgba(12,35,60,0.97) 100%)",
  accentColor: "#2E85C8",
  buttonGradient: "linear-gradient(135deg, #2E85C8 0%, #1a5a8a 100%)",
};

export function getScheme(name: string): WorldColorScheme {
  return WORLD_COLOR_SCHEMES[name] ?? DEFAULT_SCHEME;
}
