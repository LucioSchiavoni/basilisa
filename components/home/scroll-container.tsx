"use client"

import { useLayoutEffect, useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import { LogIn, ArrowUp } from "lucide-react"
import { LisaLogo } from "@/components/svg/lisa-logo"

gsap.registerPlugin(ScrollTrigger)

const LOGO_ASPECT = 744.54 / 280.68

const DESCRIPTION =
  "LISA es una plataforma digital que transforma textos en experiencias de lectura posibles. Diseñamos textos accesibles y actividades de intervención específicas para la dislexia, integrando fluidez, procesamiento léxico y comprensión en un entorno dinámico y fácil de usar."

const IDL_1 =
  "Desarrollamos una fórmula propia IDL (Índice de Dificultad Lectora), un modelo original que analiza la frecuencia y complejidad de las palabras, la estructura de las oraciones y la carga cognitiva del texto."
const IDL_2 = "Así, cada material se clasifica según su nivel real de dificultad."

const WHO_Q = "¿Quién puede usar LISA?"
const WHO_A1 =
  "Profesionales de la psicopedagogía y equipos clínicos pueden trabajar con textos clasificados según su nivel real de dificultad, diseñar progresiones controladas y abordar fluidez, procesamiento léxico y comprensión con base en evidencia."
const WHO_A2 =
  "Familias que acompañan procesos de lectura, especialmente en casos de dislexia, encuentran materiales accesibles organizados por nivel, que permiten sostener el trabajo en casa con criterios claros y coherentes."

const WHAT_Q = "¿Qué encontrarás dentro de la plataforma?"
const FEATURES = [
  "Actividades específicas para la intervención en dislexia.",
  "Progresión estructurada según nivel.",
  "Textos analizados con la fórmula original IDL (Índice de Dificultad Lectora).",
  "Clasificación objetiva de dificultad lectora.",
  "Un entorno dinámico, claro y fácil de usar.",
]

const CLOSE_1 = "LISA no es un recurso escolar general."
const CLOSE_2 =
  "Es una herramienta de intervención diseñada para procesos de lectura que requieren precisión."

const LISA_COLORS: Record<string, string> = {
  L: "#C73341",
  I: "#579F93",
  S: "#D3A021",
  A: "#2E85C8",
}

function splitWords(el: HTMLElement): HTMLElement[] {
  const raw = el.textContent || ""
  el.innerHTML = ""
  const spans: HTMLElement[] = []
  raw.split(" ").forEach((word, i) => {
    const span = document.createElement("span")
    span.style.display = "inline"
    span.style.willChange = "opacity, transform, filter"
    span.textContent = (i > 0 ? " " : "") + word
    el.appendChild(span)
    spans.push(span)
  })
  return spans
}

function splitWordsBlock(el: HTMLElement): HTMLElement[] {
  const raw = el.textContent || ""
  el.innerHTML = ""
  const spans: HTMLElement[] = []
  raw.split(" ").forEach((word, i) => {
    if (i > 0) el.appendChild(document.createTextNode(" "))
    const span = document.createElement("span")
    span.style.display = "inline-block"
    span.style.willChange = "opacity, transform, filter"
    if (word === "LISA") {
      Array.from(word).forEach((letter) => {
        const ls = document.createElement("span")
        ls.textContent = letter
        ls.style.color = LISA_COLORS[letter] ?? "inherit"
        span.appendChild(ls)
      })
    } else {
      span.textContent = word
    }
    el.appendChild(span)
    spans.push(span)
  })
  return spans
}

export function ScrollContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const headerSlotRef = useRef<HTMLDivElement>(null)
  const flyingLogoRef = useRef<HTMLDivElement>(null)

  const panel1Ref = useRef<HTMLDivElement>(null)
  const panel2Ref = useRef<HTMLDivElement>(null)
  const panel3Ref = useRef<HTMLDivElement>(null)
  const panel4Ref = useRef<HTMLDivElement>(null)
  const panel5Ref = useRef<HTMLDivElement>(null)

  const heroLogoRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)

  const idlP1Ref = useRef<HTMLParagraphElement>(null)
  const idlP2Ref = useRef<HTMLParagraphElement>(null)

  const whoQRef = useRef<HTMLHeadingElement>(null)
  const whoA1Ref = useRef<HTMLParagraphElement>(null)
  const whoA2Ref = useRef<HTMLParagraphElement>(null)

  const whatQRef = useRef<HTMLHeadingElement>(null)
  const featuresRef = useRef<(HTMLLIElement | null)[]>([])

  const closeL1Ref = useRef<HTMLParagraphElement>(null)
  const closeL2Ref = useRef<HTMLParagraphElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const ro = new ResizeObserver(() => ScrollTrigger.refresh())
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [])

  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let scrollCtx: ReturnType<typeof gsap.context> | null = null

    const ctx = gsap.context(() => {
      const heroWords = splitWords(descriptionRef.current!)
      const idlWords = [
        ...splitWords(idlP1Ref.current!),
        ...splitWords(idlP2Ref.current!),
      ]
      const close1Spans = splitWordsBlock(closeL1Ref.current!)
      const close2Spans = splitWordsBlock(closeL2Ref.current!)
      const featureEls = featuresRef.current.filter(Boolean) as HTMLElement[]

      if (prefersReduced) {
        gsap.set(heroWords, { opacity: 1, y: 0 })
        gsap.set(idlWords, { opacity: 1 })
        gsap.set([whoQRef.current, whoA1Ref.current, whoA2Ref.current], { opacity: 1, filter: "blur(0px)", y: 0 })
        gsap.set([whatQRef.current], { opacity: 1, filter: "blur(0px)", y: 0 })
        gsap.set(featureEls, { opacity: 1, x: 0 })
        gsap.set([...close1Spans, ...close2Spans], { opacity: 1, filter: "blur(0px)", y: 0, scale: 1 })
        gsap.set(closeBtnRef.current, { opacity: 1, y: 0 })
        gsap.set([panel2Ref.current, panel3Ref.current, panel4Ref.current, panel5Ref.current], { opacity: 1 })
        return
      }

      const section = panel1Ref.current!
      const letters = ["l", "i", "s", "a"].map((l) =>
        section.querySelector(`[data-letter="${l}"]`)
      )
      const rays = gsap.utils.toArray<Element>("[data-ray]", section)

      gsap.set(taglineRef.current, { opacity: 0 })
      gsap.set(letters, { opacity: 0, y: 42 })
      gsap.set(rays, { opacity: 0, y: 10 })
      gsap.set(heroWords, { opacity: 0, y: 30 })
      gsap.set(flyingLogoRef.current, { opacity: 0 })
      gsap.set(idlWords, { opacity: 0.12 })
      gsap.set(whoQRef.current, { opacity: 0, filter: "blur(28px)", y: 10 })
      gsap.set(whoA1Ref.current, { opacity: 0, filter: "blur(28px)", y: 10 })
      gsap.set(whoA2Ref.current, { opacity: 0, filter: "blur(28px)", y: 10 })
      gsap.set(whatQRef.current, { opacity: 0, filter: "blur(28px)", y: 10 })
      gsap.set(featureEls, { opacity: 0, x: -50 })
      gsap.set(close1Spans, { opacity: 0, filter: "blur(22px)", y: 28, scale: 0.88 })
      gsap.set(close2Spans, { opacity: 0, filter: "blur(16px)", y: 16, scale: 0.94 })
      gsap.set(closeBtnRef.current, { opacity: 0, y: 14 })

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

          scrollCtx = gsap.context(() => {
            const getHeroRect = () => heroLogoRef.current!.getBoundingClientRect()
            const getSlotRect = () => headerSlotRef.current!.getBoundingClientRect()

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "+=15000",
                scrub: 1.5,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            })

            tl.fromTo(
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
              .to(heroWords, {
                opacity: 1, y: 0, duration: 1, ease: "power2.out", stagger: 0.03,
              }, 1.5)

              .to(panel1Ref.current, { opacity: 0, duration: 1, ease: "power2.inOut" }, 5)
              .to(panel2Ref.current, { opacity: 1, duration: 1, ease: "power2.inOut" }, 5)

              .to(idlWords, {
                opacity: 1, stagger: 0.12, ease: "none",
              }, 6.5)

              .to(panel2Ref.current, { opacity: 0, duration: 1, ease: "power2.inOut" }, 13)
              .to(panel3Ref.current, { opacity: 1, duration: 1, ease: "power2.inOut" }, 13)

              .to(whoQRef.current, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.2, ease: "power3.out" }, 14.5)
              .to(whoA1Ref.current, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.2, ease: "power3.out" }, 16)
              .to(whoA2Ref.current, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.2, ease: "power3.out" }, 17.5)

              .to(panel3Ref.current, { opacity: 0, duration: 1, ease: "power2.inOut" }, 20)
              .to(panel4Ref.current, { opacity: 1, duration: 1, ease: "power2.inOut" }, 20)

              .to(whatQRef.current, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.5, ease: "power3.out" }, 21.5)

            featureEls.forEach((el, i) => {
              tl.to(el, { opacity: 1, x: 0, duration: 1.2, ease: "power2.out" }, 23 + i * 1.0)
            })

            const closeStart = 29
            tl.to(panel4Ref.current, { opacity: 0, duration: 1, ease: "power2.inOut" }, closeStart)
              .to(panel5Ref.current, { opacity: 1, duration: 1, ease: "power2.inOut" }, closeStart)

            const s1 = 0.28
            const s2 = 0.16
            tl.to(close1Spans, {
              opacity: 1, filter: "blur(0px)", y: 0, scale: 1,
              duration: 0.9, stagger: s1, ease: "power4.out",
            }, closeStart + 1.5)
              .to(close2Spans, {
                opacity: 1, filter: "blur(0px)", y: 0, scale: 1,
                duration: 0.9, stagger: s2, ease: "power3.out",
              }, closeStart + 1.5 + 0.9 + (close1Spans.length - 1) * s1 + 1.6)
              .to(closeBtnRef.current, {
                opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
              }, ">+=0.8")
          })
        },
      })

      entryTl
        .fromTo(
          taglineRef.current,
          { opacity: 0, filter: "blur(28px)", y: 12 },
          { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.0, ease: "power3.out" },
          0.55
        )
        .to(letters, { opacity: 1, y: 0, duration: 0.82, ease: "power3.out", stagger: 0.13 }, 0.1)
        .to(rays, { opacity: 1, y: 0, duration: 0.20, ease: "power2.out", stagger: 0.055 }, "+=0.10")
    }, containerRef)

    return () => {
      ctx.revert()
      scrollCtx?.revert()
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

      <div ref={containerRef} className="relative h-screen overflow-hidden">

        <div
          ref={panel1Ref}
          className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-4"
          style={{
            background: "radial-gradient(ellipse 130% 90% at 50% 45%, #fdf9f4 0%, #faf3ea 50%, #f6ece0 100%)",
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
          <div className="absolute inset-0 flex items-center justify-center px-8 sm:px-16 pointer-events-none">
            <p
              ref={descriptionRef}
              className="max-w-2xl text-center text-neutral-700 leading-relaxed text-2xl sm:text-3xl md:text-4xl font-extralight"
            >
              {DESCRIPTION}
            </p>
          </div>
        </div>

        <div
          ref={panel2Ref}
          className="absolute inset-0 flex items-center justify-center px-8 sm:px-16 md:px-24"
          style={{ backgroundColor: "#C73341", opacity: 0 }}
        >
          <div className="max-w-3xl mt-4 flex flex-col gap-4 text-center text-white leading-relaxed text-2xl sm:text-3xl md:text-4xl font-extralight">
            <p ref={idlP1Ref}>{IDL_1}</p>
            <p ref={idlP2Ref}>{IDL_2}</p>
          </div>
        </div>

        <div
          ref={panel3Ref}
          className="absolute inset-0 flex items-center justify-center px-8 sm:px-16 md:px-24"
          style={{
            background: "radial-gradient(ellipse 130% 90% at 50% 45%, #fdf9f4 0%, #faf3ea 50%, #f6ece0 100%)",
            opacity: 0,
          }}
        >
          <div className="max-w-4xl flex flex-col gap-6 md:gap-8 text-center">
            <h2
              ref={whoQRef}
              className="text-2xl sm:text-3xl md:text-5xl font-semibold text-neutral-700 tracking-tight leading-tight"
            >
              {WHO_Q}
            </h2>
            <p
              ref={whoA1Ref}
              className="text-base sm:text-lg md:text-4xl font-extralight text-neutral-600 leading-relaxed"
            >
              {WHO_A1}
            </p>
            <p
              ref={whoA2Ref}
              className="text-base sm:text-lg md:text-4xl font-extralight text-neutral-600 leading-relaxed"
            >
              {WHO_A2}
            </p>
          </div>
        </div>

        <div
          ref={panel4Ref}
          className="absolute inset-0 flex items-center justify-center px-8 sm:px-16 md:px-24"
          style={{ backgroundColor: "#2E85C8", opacity: 0 }}
        >
          <div className="max-w-4xl w-full flex flex-col gap-8 md:gap-10">
            <h2
              ref={whatQRef}
              className="text-2xl sm:text-3xl md:text-5xl font-semibold text-white tracking-tight leading-tight text-center"
            >
              {WHAT_Q}
            </h2>
            <ul className="flex flex-col gap-5 md:gap-7">
              {FEATURES.map((feature, i) => (
                <li
                  key={i}
                  ref={(el) => { featuresRef.current[i] = el }}
                  className="text-base sm:text-lg md:text-2xl font-extralight text-white/90 leading-relaxed flex items-baseline gap-4"
                >
                  <span className="shrink-0 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/70 translate-y-[-0.1em]" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          ref={panel5Ref}
          className="absolute inset-0 flex items-center justify-center px-8 sm:px-16 md:px-24"
          style={{
            background: "radial-gradient(ellipse 130% 90% at 50% 45%, #fdf9f4 0%, #faf3ea 50%, #f6ece0 100%)",
            opacity: 0,
          }}
        >
          <div className="max-w-3xl flex flex-col items-center gap-7 md:gap-10 text-center">
            <p
              ref={closeL1Ref}
              className="text-3xl sm:text-4xl md:text-5xl font-semibold text-neutral-800 tracking-tight leading-tight"
            >
              {CLOSE_1}
            </p>
            <p
              ref={closeL2Ref}
              className="text-2xl sm:text-3xl md:text-4xl font-semibold text-neutral-500 leading-relaxed"
            >
              {CLOSE_2}
            </p>
            <button
              ref={closeBtnRef}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Volver al inicio de la página"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
            >
              <ArrowUp size={15} strokeWidth={1.8} />
              Subir al inicio
            </button>
          </div>
        </div>
      </div>
    </>
  )
}