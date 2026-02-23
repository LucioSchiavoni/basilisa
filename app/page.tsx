import { HeroButtons } from "@/components/home/hero-buttons"

export default function Page() {
  return (
    <main className="theme-fixed-light relative flex min-h-svh flex-col overflow-hidden bg-background">
      <header className="relative z-20 flex items-center justify-end px-16 py-4">
        <HeroButtons />
      </header>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6">
        <div className="animate-slide-up text-center px-2" style={{ animationDelay: "0.2s" }}>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug text-foreground" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, sans-serif' }}>
            La plataforma donde el aprendizaje se vuelve una aventura
          </p>
        </div>
      </div>
    </main>
  )
}
