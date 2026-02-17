import Image from "next/image"
import { FloatingParticles } from "@/components/home/floating-particles"
import { HeroButtons } from "@/components/home/hero-buttons"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Page() {
  return (
    <main className="relative flex min-h-svh flex-col items-center overflow-hidden bg-background px-6 py-8">
      <FloatingParticles />

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-lg mx-auto">
        <div className="animate-slide-up pt-4 sm:pt-6" style={{ animationDelay: "0.1s" }}>
          <Image
            src="/logos/Logotipo Lisa color simple.png"
            alt="LISA"
            width={400}
            height={150}
            className="w-auto h-20 sm:h-24 object-contain"
            priority
          />
        </div>

        <div className="min-h-[180px] sm:min-h-[200px] md:min-h-[220px]" />

        <div className="animate-slide-up text-center px-2" style={{ animationDelay: "0.35s" }}>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug text-foreground" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, sans-serif' }}>
            La plataforma donde el aprendizaje se vuelve una aventura
          </p>
        </div>

        <div className="animate-slide-up w-full max-w-xs sm:max-w-sm mx-auto mt-5" style={{ animationDelay: "0.55s" }}>
          <HeroButtons />
        </div>
      </div>
    </main>
  )
}
