"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const QUESTION = "¿Qué encontrarás dentro de la plataforma?"
const FEATURES = [
  "Actividades específicas para la intervención en dislexia.",
  "Progresión estructurada según nivel.",
  "Textos analizados con la fórmula original IDL (Índice de Dificultad Lectora).",
  "Clasificación objetiva de dificultad lectora.",
  "Un entorno dinámico, claro y fácil de usar.",
]

export function WhatSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const questionRef = useRef<HTMLHeadingElement>(null)
  const featuresRef = useRef<(HTMLLIElement | null)[]>([])

  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const ctx = gsap.context(() => {
      const items = featuresRef.current.filter(Boolean) as HTMLElement[]

      if (prefersReduced) {
        gsap.set([questionRef.current, ...items], { opacity: 1, filter: "blur(0px)", x: 0, y: 0 })
        return
      }

      gsap.set(questionRef.current, { opacity: 0, filter: "blur(28px)", y: 10 })
      gsap.set(items, { opacity: 0, x: -50 })

      const endDistance = 400 + items.length * 220

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${endDistance}`,
          scrub: 1.5,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      tl.to(
        questionRef.current,
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.5, ease: "power3.out" },
        0
      )

      items.forEach((item, i) => {
        tl.to(
          item,
          { opacity: 1, x: 0, duration: 1.2, ease: "power2.out" },
          1.8 + i * 1.0
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center min-h-screen px-8 sm:px-16 md:px-24"
      style={{ backgroundColor: "#2E85C8" }}
    >
      <div className="max-w-2xl w-full flex flex-col gap-8 md:gap-10">
        <h2
          ref={questionRef}
          className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white tracking-tight leading-tight text-center"
        >
          {QUESTION}
        </h2>
        <ul className="flex flex-col gap-4">
          {FEATURES.map((feature, i) => (
            <li
              key={i}
              ref={(el) => { featuresRef.current[i] = el }}
              className="text-base sm:text-lg md:text-xl font-extralight text-white/90 leading-relaxed flex items-start gap-3"
            >
              <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-white/70" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
