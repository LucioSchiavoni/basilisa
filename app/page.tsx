import { LandingPage } from "@/components/home/landing-page"
import { IdlSection } from "@/components/home/idl-section"
import { WhoSection } from "@/components/home/who-section"
import { WhatSection } from "@/components/home/what-section"
import { ClosingSection } from "@/components/home/closing-section"
import { ScrollContainer } from "@/components/home/scroll-container"

export default function Page() {
  return (
    <main className="theme-fixed-light bg-[#fdf9f4]">
      <ScrollContainer />
    </main>
  )
}
