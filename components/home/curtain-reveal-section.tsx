"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const IDL_PART1 =
  "Desarrollamos una fórmula propia IDL (Índice de Dificultad Lectora), un modelo original que analiza la frecuencia y complejidad de las palabras, la estructura de las oraciones y la carga cognitiva del texto. Así, cada material se clasifica según su nivel real de dificultad."

const IDL_PART2 = "En LISA diseñamos recursos para ampliar el acceso a la lectura."

const BAR_COUNT = 14
const BAR_DURATION = 1.5
const BAR_STAGGER = 0.2

const TEXT1_START = 1.0
const TEXT1_DURATION = 1.6
const TEXT1_STAGGER = 0.04
const PART1_WORDS = IDL_PART1.split(" ").length
const TEXT1_END = TEXT1_START + TEXT1_DURATION + PART1_WORDS * TEXT1_STAGGER

const TEXT2_START = TEXT1_END + 3.5
const TEXT2_DURATION = 1.2
const TEXT2_STAGGER = 0.06
const PART2_WORDS = IDL_PART2.split(" ").length
const TEXT2_END = TEXT2_START + TEXT2_DURATION + PART2_WORDS * TEXT2_STAGGER

const EXIT_START = TEXT2_END + 6.0

function splitIntoSpans(el: HTMLParagraphElement) {
  const raw = el.textContent || ""
  el.innerHTML = ""
  raw.split(" ").forEach((word, i) => {
    const span = document.createElement("span")
    span.style.display = "inline"
    span.style.willChange = "transform, opacity"
    span.textContent = (i > 0 ? " " : "") + word
    el.appendChild(span)
  })
  return Array.from(el.querySelectorAll<HTMLElement>("span"))
}

export function CurtainRevealSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const barsContainerRef = useRef<HTMLDivElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)
  const text1Ref = useRef<HTMLParagraphElement>(null)
  const text2Ref = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const ctx = gsap.context(() => {
      const spans1 = splitIntoSpans(text1Ref.current!)
      const spans2 = splitIntoSpans(text2Ref.current!)

      const bars = gsap.utils.toArray<HTMLElement>(
        "[data-curtain-bar]",
        barsContainerRef.current!
      )

      if (prefersReduced) {
        gsap.set(spans1, { opacity: 1, y: 0, color: "rgba(255,255,255,0.9)" })
        gsap.set(spans2, { opacity: 1, y: 0, color: "rgba(255,255,255,1)" })
        gsap.set(bars, { yPercent: -100 })
        gsap.set(barsContainerRef.current, { autoAlpha: 0 })
        gsap.set(textLayerRef.current, { autoAlpha: 0 })
        return
      }

      gsap.set(bars, { yPercent: 100, scaleX: 1.005, transformOrigin: "left center" })
      gsap.set([...spans1, ...spans2], { opacity: 0, color: "rgba(255,255,255,0.22)", y: 20 })
      gsap.set(textLayerRef.current, { yPercent: 0 })
      gsap.set(barsContainerRef.current, { autoAlpha: 0 })

      const barEntryTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top top",
          scrub: 2,
          invalidateOnRefresh: true,
          onEnter: () => gsap.set(barsContainerRef.current, { autoAlpha: 1 }),
          onLeaveBack: () => {
            gsap.set(barsContainerRef.current, { autoAlpha: 0 })
            gsap.set(bars, { yPercent: 100 })
          },
          onEnterBack: () => gsap.set(barsContainerRef.current, { autoAlpha: 1 }),
        },
      })

      for (let i = 0; i < BAR_COUNT; i++) {
        barEntryTl.to(bars[i], { yPercent: 0, duration: BAR_DURATION, ease: "power2.inOut" }, i * BAR_STAGGER)
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=400vh",
          scrub: 2,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onLeave: () => {
            gsap.set(barsContainerRef.current, { autoAlpha: 0 })
            gsap.set(textLayerRef.current, { autoAlpha: 0 })
          },
          onEnterBack: () => {
            gsap.set(barsContainerRef.current, { autoAlpha: 1 })
            gsap.set(textLayerRef.current, { autoAlpha: 1 })
          },
        },
      })

      tl
        .to(
          textLayerRef.current,
          { autoAlpha: 1, duration: 0.5, ease: "power1.in" },
          0
        )
        .to(
          [...spans1, ...spans2],
          { opacity: 1, duration: 0.8, ease: "power1.out" },
          0
        )
        .to(
          spans1,
          {
            color: "rgba(255,255,255,0.9)",
            y: 0,
            duration: TEXT1_DURATION,
            stagger: TEXT1_STAGGER,
            ease: "power2.out",
          },
          TEXT1_START
        )
        .to(
          spans2,
          {
            color: "rgba(255,255,255,1)",
            y: 0,
            duration: TEXT2_DURATION,
            stagger: TEXT2_STAGGER,
            ease: "power2.out",
          },
          TEXT2_START
        )
        .to(
          textLayerRef.current,
          { yPercent: -100, autoAlpha: 0, duration: 3.0, ease: "power3.inOut" },
          EXIT_START
        )

      for (let i = 0; i < BAR_COUNT; i++) {
        tl.to(
          bars[BAR_COUNT - 1 - i],
          { yPercent: -100, duration: BAR_DURATION, ease: "power2.inOut" },
          EXIT_START + 0.5 + i * BAR_STAGGER
        )
      }

      const lastBarExit = EXIT_START + 0.5 + (BAR_COUNT - 1) * BAR_STAGGER + BAR_DURATION
      tl.to({}, { duration: 0.3 }, lastBarExit)
    })

    return () => ctx.revert()
  }, [])

  return (
    <>
      <div
        ref={barsContainerRef}
        className="pointer-events-none fixed inset-0 overflow-hidden"
        style={{
          zIndex: 40,
          display: "grid",
          gridTemplateColumns: `repeat(${BAR_COUNT}, 1fr)`,
          visibility: "hidden",
        }}
        aria-hidden="true"
      >
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <div
            key={`bar-${i}`}
            data-curtain-bar
            className="h-full"
            style={{
              backgroundColor: "#C73341",
              willChange: "transform",
              boxShadow: "2px 0 0 0 #C73341",
            }}
          />
        ))}
      </div>

      <div
        ref={textLayerRef}
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 45, visibility: "hidden" }}
      >
        <div className="px-8 sm:px-16 max-w-3xl mx-auto flex flex-col items-center gap-10">
          <p
            ref={text1Ref}
            className="text-center text-white/90 leading-relaxed text-xl sm:text-2xl md:text-3xl font-extralight"
          >
            {IDL_PART1}
          </p>
          <p
            ref={text2Ref}
            className="text-center text-white leading-relaxed text-xl sm:text-2xl md:text-3xl font-extralight"
          >
            {IDL_PART2}
          </p>
        </div>
      </div>

      <section
        ref={sectionRef}
        className="relative h-screen overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 130% 90% at 50% 45%, #fdf9f4 0%, #faf3ea 50%, #f6ece0 100%)",
        }}
      />
    </>
  )
}