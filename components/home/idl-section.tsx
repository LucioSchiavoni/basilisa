"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const TEXT =
  "Desarrollamos una fórmula propia IDL (Índice de Dificultad Lectora), un modelo original que analiza la frecuencia y complejidad de las palabras, la estructura de las oraciones y la carga cognitiva del texto. Así, cada material se clasifica según su nivel real de dificultad."

export function IdlSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const ctx = gsap.context(() => {
      const para = textRef.current!
      const rawText = para.textContent || ""
      para.innerHTML = ""
      rawText.split(" ").forEach((word, i) => {
        const span = document.createElement("span")
        span.style.display = "inline"
        span.style.willChange = "opacity"
        span.textContent = (i > 0 ? " " : "") + word
        para.appendChild(span)
      })
      const wordSpans = Array.from(para.querySelectorAll<HTMLElement>("span"))

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
          end: `+=${wordSpans.length * 18}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex items-center justify-center min-h-screen px-8 sm:px-16 md:px-24"
      style={{ backgroundColor: "#C73341" }}
    >
      <p
        ref={textRef}
        className="max-w-3xl text-center text-white leading-relaxed text-2xl sm:text-3xl md:text-4xl font-extralight"
      >
        {TEXT}
      </p>
    </section>
  )
}
