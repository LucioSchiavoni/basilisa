"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import { LogIn } from "lucide-react"
import { LisaLogo } from "@/components/svg/lisa-logo"
import { WatercolorBackground } from "./watercolor-background"
import { CurtainRevealSection } from "./curtain-reveal-section"

gsap.registerPlugin(ScrollTrigger)

const LOGO_ASPECT = 744.54 / 280.68

const DESCRIPTION =
  "LISA es una plataforma digital que transforma textos en experiencias de lectura posibles. Diseñamos textos accesibles y actividades de intervención específicas para la dislexia, integrando fluidez, procesamiento léxico y comprensión en un entorno dinámico y fácil de usar."

export function LandingPage() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerSlotRef = useRef<HTMLDivElement>(null)
  const flyingLogoRef = useRef<HTMLDivElement>(null)
  const heroLogoRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const scrollCtx = { current: null as ReturnType<typeof gsap.context> | null }

    const ctx = gsap.context(() => {
      const section = sectionRef.current!
      const stains = gsap.utils.toArray<Element>("[data-stain]", section)
      const leftStains = stains.slice(0, 4)
      const rightStains = stains.slice(4, 8)
      const letters = ["l", "i", "s", "a"].map((l) =>
        section.querySelector(`[data-letter="${l}"]`)
      )
      const rays = gsap.utils.toArray<Element>("[data-ray]", section)

      const para = descriptionRef.current!
      const rawText = para.textContent || ""
      para.innerHTML = ""
      rawText.split(" ").forEach((word, i) => {
        const span = document.createElement("span")
        span.style.display = "inline"
        span.style.willChange = "transform, opacity"
        span.textContent = (i > 0 ? " " : "") + word
        para.appendChild(span)
      })
      const wordSpans = Array.from(para.querySelectorAll<HTMLElement>("span"))

      if (prefersReduced) {
        gsap.set(taglineRef.current, { opacity: 1 })
        gsap.set(letters, { opacity: 1, y: 0 })
        gsap.set(rays, { opacity: 1, y: 0 })
        gsap.set(wordSpans, { opacity: 1, y: 0 })
        return
      }

      gsap.set(taglineRef.current, { opacity: 0 })
      gsap.set(stains, { opacity: 0, scale: 0.35 })
      gsap.set(letters, { opacity: 0, y: 42 })
      gsap.set(rays, { opacity: 0, y: 10 })
      gsap.set(wordSpans, { opacity: 0, y: 30 })
      gsap.set(flyingLogoRef.current, { opacity: 0 })

      const entryTl = gsap.timeline({
        onComplete() {
          const rect = heroLogoRef.current!.getBoundingClientRect()
          const flying = flyingLogoRef.current!

          gsap.set(flying, {
            width: rect.width,
            height: rect.height,
            x: rect.left,
            y: rect.top,
            scale: 1,
            transformOrigin: "0 0",
            opacity: 1,
          })
          gsap.set(
            Array.from(flying.querySelectorAll("[data-letter], [data-ray]")),
            { opacity: 1 }
          )
          gsap.set(heroLogoRef.current, { visibility: "hidden" })

          scrollCtx.current = gsap.context(() => {
            const getHeroRect = () => heroLogoRef.current!.getBoundingClientRect()
            const getSlotRect = () => headerSlotRef.current!.getBoundingClientRect()

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: "+=300vh",
                scrub: 1,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            })

            tl
              .to(leftStains, { x: -420, duration: 1.2, ease: "power2.in" }, 0)
              .to(rightStains, { x: 420, duration: 1.2, ease: "power2.in" }, 0)
              .fromTo(
                taglineRef.current,
                { opacity: 1, y: 0 },
                { opacity: 0, y: -30, duration: 1, ease: "power2.in" },
                0
              )
              .fromTo(
                flyingLogoRef.current,
                {
                  x: () => getHeroRect().left,
                  y: () => getHeroRect().top,
                  scale: 1,
                },
                {
                  x: () => getSlotRect().left,
                  y: () => getSlotRect().top,
                  scale: () => getSlotRect().height / getHeroRect().height,
                  duration: 3,
                  ease: "power2.inOut",
                },
                0
              )
              .to(
                wordSpans,
                {
                  opacity: 1,
                  y: 0,
                  duration: 1,
                  ease: "power2.out",
                  stagger: 0.03,
                },
                1.5
              )
          })
        },
      })

      entryTl
        .to(leftStains, { opacity: 1, scale: 1, duration: 1.9, ease: "power1.out", stagger: 0.22 }, 0)
        .to(rightStains, { opacity: 1, scale: 1, duration: 1.9, ease: "power1.out", stagger: 0.22 }, 0.18)
        .fromTo(
          taglineRef.current,
          { opacity: 0, filter: "blur(28px)", y: 12 },
          { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.0, ease: "power3.out" },
          0.55
        )
        .to(letters, { opacity: 1, y: 0, duration: 0.82, ease: "power3.out", stagger: 0.13 }, "+=0.20")
        .to(rays, { opacity: 1, y: 0, duration: 0.20, ease: "power2.out", stagger: 0.055 }, "+=0.10")
    }, sectionRef)

    return () => {
      ctx.revert()
      scrollCtx.current?.revert()
    }
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between md:justify-end px-6 sm:px-16 py-4">
        <div
          ref={headerSlotRef}
          className="h-8 w-[85px] md:absolute md:left-1/2 md:-translate-x-1/2 md:h-11 md:w-[117px]"
        />
        <Link
          href="/login"
          className="flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium text-neutral-800 bg-white/90 hover:bg-white transition-colors duration-200"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>Comenzar</span>
        </Link>
      </header>

      <div
        ref={flyingLogoRef}
        className="fixed pointer-events-none"
        style={{ top: 0, left: 0, zIndex: 49, willChange: "transform" }}
        aria-hidden
      >
        <LisaLogo className="w-full h-full" />
      </div>

      <section
        ref={sectionRef}
        className="relative h-screen overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 130% 90% at 50% 45%, #fdf9f4 0%, #faf3ea 50%, #f6ece0 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 18% 78%, rgba(251,222,200,0.35) 0%, transparent 52%), radial-gradient(circle at 82% 18%, rgba(248,216,190,0.28) 0%, transparent 48%), radial-gradient(circle at 55% 90%, rgba(253,230,210,0.22) 0%, transparent 40%)",
          }}
        />
        <WatercolorBackground />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-4">
          <div ref={heroLogoRef} style={{ willChange: "transform" }}>
            <LisaLogo className="w-64 h-auto sm:w-80 select-none" />
          </div>
          <div
            ref={taglineRef}
            style={{ opacity: 0, willChange: "transform, opacity" }}
            className="flex flex-col items-center gap-y-1 text-center md:flex-row md:flex-wrap md:justify-center md:items-baseline md:gap-y-0 md:gap-x-[0.3em]"
          >
            <h1 className="text-xl sm:text-2xl md:text-[1.9rem] lg:text-3xl font-semibold text-neutral-700 tracking-tight leading-tight whitespace-nowrap">
              Lectura <span style={{ color: "#C73341" }}>accesible</span>
            </h1>
            <span className="text-xl sm:text-2xl md:text-[1.9rem] lg:text-3xl font-semibold text-neutral-700 tracking-tight leading-tight whitespace-nowrap">
              basada en <span style={{ color: "#2E85C8" }}>evidencia</span>.
            </span>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center px-8 sm:px-16 pointer-events-none">
          <p
            ref={descriptionRef}
            className="max-w-2xl text-center text-neutral-700 leading-relaxed text-2xl sm:text-3xl md:text-4xl font-extralight"
          >
            {DESCRIPTION}
          </p>
        </div>
      </section>
      <CurtainRevealSection />
    </>
  )
}
