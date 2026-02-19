"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export function ForceDarkOnWorldPages() {
  const pathname = usePathname()
  const isWorldPage = pathname === "/ejercicios" || pathname.startsWith("/ejercicios/mundos")
  const wasForced = useRef(false)

  useEffect(() => {
    const html = document.documentElement
    if (isWorldPage) {
      if (!html.classList.contains("dark")) {
        html.classList.add("dark")
        wasForced.current = true
      }
    } else {
      if (wasForced.current) {
        html.classList.remove("dark")
        wasForced.current = false
      }
    }
  }, [isWorldPage])

  return null
}
