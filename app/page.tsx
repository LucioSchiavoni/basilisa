import { HeroButtons } from "@/components/home/hero-buttons"
import { HeroSection } from "@/components/home/hero-section"

export default function Page() {
  return (
    <main className="theme-fixed-light relative min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center sm:justify-end px-6 sm:px-16 py-4">
        <HeroButtons />
      </header>
      <HeroSection />
    </main>
  )
}
