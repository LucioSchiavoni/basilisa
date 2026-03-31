"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const QUESTION = "¿Quién puede usar LISA?"
const ANSWER_1 =
  "Profesionales de la psicopedagogía y equipos clínicos pueden trabajar con textos clasificados según su nivel real de dificultad, diseñar progresiones controladas y abordar fluidez, procesamiento léxico y comprensión con base en evidencia."
const ANSWER_2 =
  "Familias que acompañan procesos de lectura, especialmente en casos de dislexia, encuentran materiales accesibles organizados por nivel, que permiten sostener el trabajo en casa con criterios claros y coherentes."

export function WhoSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const questionRef = useRef<HTMLHeadingElement>(null)
  const answer1Ref = useRef<HTMLParagraphElement>(null)
  const answer2Ref = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set([questionRef.current, answer1Ref.current, answer2Ref.current], { opacity: 1, filter: "blur(0px)", y: 0 })
        return
      }

      gsap.set(questionRef.current, { opacity: 0, filter: "blur(28px)", y: 10 })
      gsap.set(answer1Ref.current, { opacity: 0, filter: "blur(28px)", y: 10 })
      gsap.set(answer2Ref.current, { opacity: 0, filter: "blur(28px)", y: 10 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=1300",
          scrub: 1.5,
          pin: true,
          anticipatePin: 1,
          pinSpacing: "margin",
          invalidateOnRefresh: true,
        },
      })

      tl.to(
        questionRef.current,
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.2, ease: "power3.out" },
        0
      )
      tl.to(
        answer1Ref.current,
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.2, ease: "power3.out" },
        1.5
      )
      tl.to(
        answer2Ref.current,
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.2, ease: "power3.out" },
        3.0
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
      <div className="max-w-2xl flex flex-col gap-6 md:gap-8 text-center">
        <h2
          ref={questionRef}
          className="text-2xl sm:text-3xl md:text-4xl font-semibold text-neutral-700 tracking-tight leading-tight"
        >
          {QUESTION}
        </h2>
        <p
          ref={answer1Ref}
          className="text-base sm:text-lg md:text-xl font-extralight text-neutral-600 leading-relaxed"
        >
          {ANSWER_1}
        </p>
        <p
          ref={answer2Ref}
          className="text-base sm:text-lg md:text-xl font-extralight text-neutral-600 leading-relaxed"
        >
          {ANSWER_2}
        </p>
      </div>
    </section>
  )
}
