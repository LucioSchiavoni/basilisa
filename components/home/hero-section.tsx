"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { WatercolorBackground } from "./watercolor-background"
import { LisaLogo } from "@/components/svg/lisa-logo"

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const line1Ref = useRef<HTMLHeadingElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const ctx = gsap.context(() => {
      const stains = gsap.utils.toArray<Element>("[data-stain]", sectionRef.current)
      const leftStains = stains.slice(0, 4)
      const rightStains = stains.slice(4, 8)

      const letterL = sectionRef.current?.querySelector('[data-letter="l"]')
      const letterI = sectionRef.current?.querySelector('[data-letter="i"]')
      const letterS = sectionRef.current?.querySelector('[data-letter="s"]')
      const letterA = sectionRef.current?.querySelector('[data-letter="a"]')
      const letters = [letterL, letterI, letterS, letterA]

      const rays = gsap.utils.toArray<Element>("[data-ray]", sectionRef.current)

      if (prefersReduced) {
        gsap.set([line1Ref.current, line2Ref.current], { opacity: 1 })
        gsap.set(letters, { opacity: 1, y: 0 })
        gsap.set(rays, { opacity: 1, y: 0 })
        return
      }

      gsap.set([line1Ref.current, line2Ref.current], { opacity: 0 })
      gsap.set(stains, { opacity: 0, scale: 0.35 })
      gsap.set(letters, { opacity: 0, y: 42 })
      gsap.set(rays, { opacity: 0, y: 10 })

      const smokeFrom = { opacity: 0, filter: "blur(28px)", y: 12 }
      const smokeTo = { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.0, ease: "power3.out" }

      const tl = gsap.timeline()

      tl
        .to(leftStains, {
          opacity: 1,
          scale: 1,
          duration: 1.9,
          ease: "power1.out",
          stagger: 0.22,
        }, 0)
        .to(rightStains, {
          opacity: 1,
          scale: 1,
          duration: 1.9,
          ease: "power1.out",
          stagger: 0.22,
        }, 0.18)
        .fromTo(line1Ref.current, smokeFrom, smokeTo, 0.55)
        .fromTo(line2Ref.current, smokeFrom, { ...smokeTo }, "-=0.65")
        .to(letters, {
          opacity: 1,
          y: 0,
          duration: 0.82,
          ease: "power3.out",
          stagger: 0.13,
        }, "+=0.20")
        .to(rays, {
          opacity: 1,
          y: 0,
          duration: 0.20,
          ease: "power2.out",
          stagger: 0.055,
        }, "+=0.10")
        .call(() => {
          stains.forEach((stain) => {
            gsap.to(stain, {
              y: `+=${4 + Math.random() * 5}`,
              rotation: (Math.random() - 0.5) * 2.5,
              duration: 4 + Math.random() * 3,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              delay: Math.random() * 2,
            })
          })
        })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
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

      <div className="relative z-10 flex flex-col items-center gap-10 px-4 text-center">
        <LisaLogo className="w-64 h-auto sm:w-80 md:w-[26rem] lg:w-[30rem] select-none" />

        <div className="flex flex-col items-center gap-y-1 md:flex-row md:flex-wrap md:justify-center md:items-baseline md:gap-y-0 md:gap-x-[0.3em]">
          <h1
            ref={line1Ref}
            style={{ display: "inline-block", opacity: 0 }}
            className="text-xl sm:text-2xl md:text-[1.9rem] lg:text-3xl font-semibold text-neutral-700 tracking-tight leading-tight whitespace-nowrap"
          >
            Lectura <span style={{ color: "#C73341" }}>accesible</span>,
          </h1>
          <span
            ref={line2Ref}
            style={{ display: "inline-block", opacity: 0 }}
            className="text-xl sm:text-2xl md:text-[1.9rem] lg:text-3xl font-semibold text-neutral-700 tracking-tight leading-tight whitespace-nowrap"
          >
            Basada en <span style={{ color: "#2E85C8" }}>evidencia</span>.
          </span>
        </div>
      </div>
    </section>
  )
}
