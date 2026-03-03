import { LandingPage } from "@/components/home/landing-page"
import { IdlSection } from "@/components/home/idl-section"

export default function Page() {
  return (
    <main className="theme-fixed-light bg-[#fdf9f4]">
      <LandingPage />
      <IdlSection />
    </main>
  )
}
