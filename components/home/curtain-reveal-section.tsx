"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const IDL_PART1 =
  "Desarrollamos una fórmula propia IDL (Índice de Dificultad Lectora), un modelo original que analiza la frecuencia y complejidad de las palabras, la estructura de las oraciones y la carga cognitiva del texto. Así, cada material se clasifica según su nivel real de dificultad."

const IDL_PART2 = "En LISA diseñamos recursos para ampliar el acceso a la lectura."

const BAR_COUNT = 5

const BARS_DURATION = 2.6
const BARS_STAGGER = 0.12
const BARS_COVER_END = BARS_DURATION + (BAR_COUNT - 1) * BARS_STAGGER

const TEXT1_START = BARS_COVER_END + 1.2
const TEXT1_DURATION = 1.2
const TEXT1_STAGGER = 0.025
const PART1_WORDS = IDL_PART1.split(" ").length
const TEXT1_END = TEXT1_START + TEXT1_DURATION + PART1_WORDS * TEXT1_STAGGER

const TEXT2_START = TEXT1_END + 2.0
const TEXT2_DURATION = 1.0
const TEXT2_STAGGER = 0.045
const PART2_WORDS = IDL_PART2.split(" ").length
const TEXT2_END = TEXT2_START + TEXT2_DURATION + PART2_WORDS * TEXT2_STAGGER

const EXIT_START = TEXT2_END + 1.8

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
        gsap.set([...spans1, ...spans2], { opacity: 1, y: 0 })
        gsap.set(bars, { yPercent: -100 })
        gsap.set(textLayerRef.current, { yPercent: -100 })
        return
      }

      gsap.set(bars, { yPercent: 100 })
      gsap.set([...spans1, ...spans2], { opacity: 0, y: 30 })
      gsap.set(textLayerRef.current, { yPercent: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=340vh",
          scrub: 2,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      tl
        .to(
          bars,
          {
            yPercent: 0,
            duration: BARS_DURATION,
            stagger: { each: BARS_STAGGER, from: "start" },
            ease: "power3.inOut",
          },
          0
        )
        .to(
          spans1,
          {
            opacity: 1,
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
            opacity: 1,
            y: 0,
            duration: TEXT2_DURATION,
            stagger: TEXT2_STAGGER,
            ease: "power2.out",
          },
          TEXT2_START
        )
        .to(
          bars,
          {
            yPercent: -100,
            duration: BARS_DURATION,
            stagger: { each: BARS_STAGGER, from: "start" },
            ease: "power3.inOut",
          },
          EXIT_START
        )
        .to(
          textLayerRef.current,
          {
            yPercent: -100,
            duration: BARS_DURATION,
            ease: "power3.inOut",
          },
          EXIT_START
        )
    })

    return () => ctx.revert()
  }, [])

  return (
    <>
      <div ref={barsContainerRef} className="pointer-events-none" aria-hidden>
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <div
            key={i}
            data-curtain-bar
            className="fixed top-0 h-screen"
            style={{
              left: `${(i / BAR_COUNT) * 100}%`,
              width: `${100 / BAR_COUNT}%`,
              backgroundColor: "#C73341",
              zIndex: 40,
              willChange: "transform",
            }}
          />
        ))}
      </div>

      <div
        ref={textLayerRef}
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 45 }}
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
            className="text-center text-white leading-snug text-2xl sm:text-3xl md:text-4xl font-light"
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
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 18% 78%, rgba(251,222,200,0.35) 0%, transparent 52%), radial-gradient(circle at 82% 18%, rgba(248,216,190,0.28) 0%, transparent 48%), radial-gradient(circle at 55% 90%, rgba(253,230,210,0.22) 0%, transparent 40%)",
          }}
        />
      </section>
    </>
  )
}
