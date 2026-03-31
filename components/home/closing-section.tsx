"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowUp } from "lucide-react"
import { WatercolorBackground } from "./watercolor-background"

gsap.registerPlugin(ScrollTrigger)

const LINE_1 = "LISA no es un recurso escolar general."
const LINE_2 =
  "Es una herramienta de intervención diseñada para procesos de lectura que requieren precisión."

const LISA_COLORS: Record<string, string> = {
  L: "#C73341",
  I: "#579F93",
  S: "#D3A021",
  A: "#2E85C8",
}

export function ClosingSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const line1Ref = useRef<HTMLParagraphElement>(null)
  const line2Ref = useRef<HTMLParagraphElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const ctx = gsap.context(() => {
      const section = sectionRef.current!
      const stains = gsap.utils.toArray<Element>("[data-stain]", section)
      const leftStains = stains.slice(0, 4)
      const rightStains = stains.slice(4, 8)

      const line1Spans: HTMLElement[] = []
      const line2Spans: HTMLElement[] = []

      const splitWords = (el: HTMLElement | null, target: HTMLElement[]) => {
        if (!el) return
        const text = el.textContent || ""
        el.innerHTML = ""
        text.split(" ").forEach((word, i) => {
          if (i > 0) el.appendChild(document.createTextNode(" "))
          const span = document.createElement("span")
          span.style.display = "inline-block"
          span.style.willChange = "opacity, transform, filter"
          if (word === "LISA") {
            Array.from(word).forEach((letter) => {
              const letterSpan = document.createElement("span")
              letterSpan.textContent = letter
              letterSpan.style.color = LISA_COLORS[letter] ?? "inherit"
              span.appendChild(letterSpan)
            })
          } else {
            span.textContent = word
          }
          el.appendChild(span)
          target.push(span)
        })
      }

      splitWords(line1Ref.current, line1Spans)
      splitWords(line2Ref.current, line2Spans)

      const allSpans = [...line1Spans, ...line2Spans]

      if (prefersReduced) {
        gsap.set(allSpans, { opacity: 1, filter: "blur(0px)", y: 0, scale: 1 })
        gsap.set(btnRef.current, { opacity: 1, y: 0 })
        gsap.set(stains, { opacity: 1, scale: 1 })
        return
      }

      gsap.set(line1Spans, { opacity: 0, filter: "blur(22px)", y: 28, scale: 0.88 })
      gsap.set(line2Spans, { opacity: 0, filter: "blur(16px)", y: 16, scale: 0.94 })
      gsap.set(btnRef.current, { opacity: 0, y: 14 })
      gsap.set(stains, { opacity: 0, scale: 0.35 })

      const stagger1 = 0.28
      const stagger2 = 0.16
      const line1End = 0.9 + (line1Spans.length - 1) * stagger1
      const line2Start = line1End + 1.6
      const line2End = line2Start + 0.9 + (line2Spans.length - 1) * stagger2
      const btnStart = line2End + 0.8
      const scrollEnd = (btnStart + 1.2) * 190

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${scrollEnd}`,
          scrub: 1.8,
          pin: true,
          anticipatePin: 1,
          pinSpacing: "margin",
          invalidateOnRefresh: true,
        },
      })

      tl.to(leftStains, { opacity: 1, scale: 1, duration: 1.9, ease: "power1.out", stagger: 0.22 }, 0)
      tl.to(rightStains, { opacity: 1, scale: 1, duration: 1.9, ease: "power1.out", stagger: 0.22 }, 0.18)

      tl.to(
        line1Spans,
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          scale: 1,
          duration: 0.9,
          stagger: stagger1,
          ease: "power4.out",
        },
        0
      )

      tl.to(
        line2Spans,
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          scale: 1,
          duration: 0.9,
          stagger: stagger2,
          ease: "power3.out",
        },
        line2Start
      )

      tl.to(
        btnRef.current,
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        btnStart
      )
      tl.to({}, { duration: 1.5 })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center min-h-screen px-8 sm:px-16 md:px-24"
      style={{
        background:
          "#ffffff",
      }}
    >
      {/* <WatercolorBackground /> */}
      <div className="relative max-w-3xl flex flex-col items-center gap-7 md:gap-10 text-center">
        <p
          ref={line1Ref}
          className="text-3xl sm:text-4xl md:text-5xl font-semibold text-neutral-800 tracking-tight leading-tight"
        >
          {LINE_1}
        </p>
        <p
          ref={line2Ref}
          className="text-2xl sm:text-3xl md:text-4xl font-semibold text-neutral-500 leading-relaxed"
        >
          {LINE_2}
        </p>
        <button
          ref={btnRef}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Volver al inicio de la página"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
        >
          <ArrowUp size={15} strokeWidth={1.8} />
          Subir al inicio
        </button>
      </div>
    </section>
  )
}
