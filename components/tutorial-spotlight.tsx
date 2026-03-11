"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight } from "lucide-react"

const CALLOUTS: Record<string, { title: string; body: string; next: string | null }> = {
  full_name: {
    title: "¿Cómo te llamás?",
    body: "Tu nombre completo personaliza tu experiencia en LISA.",
    next: "phone",
  },
  phone: {
    title: "Un teléfono de contacto",
    body: "Lo usamos solo si necesitamos comunicarnos con vos.",
    next: null,
  },
}

type Props = { targetField: "full_name" | "phone" }
type Rect = { top: number; left: number; right: number; bottom: number; width: number; height: number }

function lockScroll() {
  const scrollY = window.scrollY
  document.documentElement.style.overflow = "hidden"
  document.body.style.overflow = "hidden"
  document.body.style.position = "fixed"
  document.body.style.top = `-${scrollY}px`
  document.body.style.width = "100%"
  return scrollY
}

function unlockScroll(scrollY: number) {
  document.documentElement.style.overflow = ""
  document.body.style.overflow = ""
  document.body.style.position = ""
  document.body.style.top = ""
  document.body.style.width = ""
  window.scrollTo(0, scrollY)
}

export function TutorialSpotlight({ targetField }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tutorial = searchParams.get("tutorial")
  const [rect, setRect] = useState<Rect | null>(null)

  useEffect(() => {
    if (tutorial !== targetField) return

    const el = document.querySelector(`[data-spotlight="${targetField}"]`) as Element | null
    if (!el) return

    const target = el

    target.scrollIntoView({ behavior: "smooth", block: "center" })

    let savedScrollY = 0
    let interval: ReturnType<typeof setInterval>

    const lockTimer = setTimeout(() => {
      savedScrollY = lockScroll()

      function measure() {
        const r = target.getBoundingClientRect()
        setRect({ top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height })
      }

      measure()
      interval = setInterval(measure, 150)
      window.addEventListener("resize", measure)

      ;(target as any)._unlockScroll = () => {
        clearInterval(interval)
        window.removeEventListener("resize", measure)
        unlockScroll(savedScrollY)
      }
    }, 450)

    return () => {
      clearTimeout(lockTimer)
      const unlock = (target as any)._unlockScroll
      if (unlock) {
        unlock()
        delete (el as any)._unlockScroll
      } else {
        unlockScroll(savedScrollY)
      }
    }
  }, [tutorial, targetField])

  if (tutorial !== targetField || !rect) return null

  const callout = CALLOUTS[targetField]
  const pad = 12
  const vw = window.innerWidth
  const vh = window.innerHeight

  const spotTop = rect.top - pad
  const spotLeft = rect.left - pad
  const spotRight = rect.right + pad
  const spotBottom = rect.bottom + pad
  const spotW = rect.width + pad * 2
  const spotH = rect.height + pad * 2

  const calloutBelow = spotBottom + 170 < vh

  const savedScrollY = (() => {
    const top = document.body.style.top
    return top ? Math.abs(parseInt(top, 10)) : 0
  })()

  function dismiss() {
    const unlock = (document.querySelector(`[data-spotlight="${targetField}"]`) as any)?._unlockScroll
    if (unlock) unlock()
    router.replace("/ejercicios")
  }

  function next() {
    const unlock = (document.querySelector(`[data-spotlight="${targetField}"]`) as any)?._unlockScroll
    if (unlock) unlock()
    if (callout.next) {
      router.replace(`/editar-perfil?tutorial=${callout.next}`)
    } else {
      router.replace("/editar-perfil")
    }
  }

  const OVERFLOW = 300

  return (
    <>
      <div
        className="fixed z-[61] bg-black/65 pointer-events-auto"
        style={{ top: -OVERFLOW, left: -OVERFLOW, right: -OVERFLOW, height: spotTop + OVERFLOW }}
      />
      <div
        className="fixed z-[61] bg-black/65 pointer-events-auto"
        style={{ top: spotBottom, left: -OVERFLOW, right: -OVERFLOW, height: vh - spotBottom + OVERFLOW }}
      />
      <div
        className="fixed z-[61] bg-black/65 pointer-events-auto"
        style={{ top: spotTop, left: -OVERFLOW, width: spotLeft + OVERFLOW, height: spotH }}
      />
      <div
        className="fixed z-[61] bg-black/65 pointer-events-auto"
        style={{ top: spotTop, left: spotRight, width: vw - spotRight + OVERFLOW, height: spotH }}
      />

      <div
        className="fixed z-[63] w-full max-w-sm px-4"
        style={{
          top: calloutBelow ? spotBottom + 14 : undefined,
          bottom: calloutBelow ? undefined : vh - spotTop + 14,
          left: Math.min(Math.max(16, rect.left - 8), vw - 344),
        }}
      >
        <div className="rounded-2xl bg-white shadow-2xl border border-neutral-100 overflow-hidden">
          <div className="bg-[#579F93] px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
              Completar perfil
            </span>
            <button
              type="button"
              onClick={dismiss}
              className="text-xs text-white/70 hover:text-white transition-colors font-medium"
            >
              Más tarde
            </button>
          </div>
          <div className="px-4 py-4 space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-neutral-800">{callout.title}</p>
              <p className="text-xs text-neutral-500 leading-relaxed">{callout.body}</p>
            </div>
            <button
              type="button"
              onClick={next}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-[#579F93] hover:bg-[#4a8e83] transition-colors"
            >
              {callout.next ? "Siguiente campo" : "Entendido"}
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
