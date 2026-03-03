"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const TEXT_1 =
  "Desarrollamos una fórmula propia IDL (Índice de Dificultad Lectora), un modelo original que analiza la frecuencia y complejidad de las palabras, la estructura de las oraciones y la carga cognitiva del texto."
const TEXT_2 = "Así, cada material se clasifica según su nivel real de dificultad."

export function IdlSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const p1Ref = useRef<HTMLParagraphElement>(null)
  const p2Ref = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const ctx = gsap.context(() => {
      const wordSpans: HTMLElement[] = []

      const processPara = (para: HTMLParagraphElement | null) => {
        if (!para) return
        const rawText = para.textContent || ""
        para.innerHTML = ""
        rawText.split(" ").forEach((word, i) => {
          const span = document.createElement("span")
          span.style.display = "inline"
          span.style.willChange = "opacity"
          span.textContent = (i > 0 ? " " : "") + word
          para.appendChild(span)
          wordSpans.push(span)
        })
      }

      processPara(p1Ref.current)
      processPara(p2Ref.current)

      if (prefersReduced) {
        gsap.set(wordSpans, { opacity: 1 })
        return
      }

      gsap.set(wordSpans, { opacity: 0.12 })

      gsap.to(wordSpans, {
        opacity: 1,
        stagger: 0.12,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${wordSpans.length * 18 + 250}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          pinSpacing: "margin",
          invalidateOnRefresh: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center min-h-screen px-8 sm:px-16 md:px-24"
      style={{ backgroundColor: "#C73341" }}
    >
      <div className="max-w-3xl flex flex-col gap-8 text-center text-white leading-relaxed text-2xl sm:text-3xl md:text-4xl font-extralight">
        <p ref={p1Ref}>{TEXT_1}</p>
        <p ref={p2Ref}>{TEXT_2}</p>
      </div>
    </section>
  )
}
