"use client"

import { useState, useEffect } from "react"

const MESSAGES = [
  "Analizando el texto...",
  "Simplificando palabras complejas...",
  "Ajustando el ritmo de las oraciones...",
  "Revisando fluidez lectora...",
  "Casi listo...",
]

export function TypewriterLoading() {
  const [msgIndex, setMsgIndex] = useState(0)
  const [displayed, setDisplayed] = useState("")
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const msg = MESSAGES[msgIndex]
    if (displayed.length < msg.length) {
      const t = setTimeout(() => setDisplayed(msg.slice(0, displayed.length + 1)), 38)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      setFading(true)
      setTimeout(() => {
        setDisplayed("")
        setFading(false)
        setMsgIndex((i) => (i + 1) % MESSAGES.length)
      }, 350)
    }, 1400)
    return () => clearTimeout(t)
  }, [displayed, msgIndex])

  return (
    <div className="px-5 py-8 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-1.5 h-1.5 rounded-full bg-[#2E85C8]"
              style={{
                animation: `bounce 1.2s ease-in-out ${i * 0.18}s infinite`,
              }}
            />
          ))}
        </div>
        <p
          className="text-sm font-light text-muted-foreground transition-opacity duration-300"
          style={{ opacity: fading ? 0 : 1 }}
        >
          {displayed}
          {!fading && <span className="animate-pulse ml-px">|</span>}
        </p>
      </div>

      <div className="space-y-2.5 opacity-30">
        {[72, 55, 85, 48, 65].map((w, i) => (
          <div
            key={i}
            className="h-3 bg-muted rounded-full animate-pulse"
            style={{ width: `${w}%`, animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}
