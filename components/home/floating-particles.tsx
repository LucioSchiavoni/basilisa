"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
  icon: string
  rotation: number
  rotationSpeed: number
}

const ICONS = [
  "📖", "📚", "✏️", "🖊️", "📝", "🎒",
  "📐", "📏", "🔬", "🧪", "🎨", "🖍️",
  "💡", "🧠", "🎓", "📓", "🔤", "🏆",
  "⭐", "🌟", "✨",
  "A", "B", "C", "M", "X", "Z",
]

const COLORS = [
  "hsl(250, 100%, 65%)",
  "hsl(340, 92%, 55%)",
  "hsl(45, 100%, 55%)",
  "hsl(160, 85%, 45%)",
  "hsl(280, 80%, 60%)",
  "hsl(200, 90%, 55%)",
]

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const count = Math.max(15, Math.min(Math.floor((window.innerWidth * window.innerHeight) / 20000), 35))

    particlesRef.current = Array.from({ length: count }, () => {
      const icon = ICONS[Math.floor(Math.random() * ICONS.length)]
      const isEmoji = icon.length > 1
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: isEmoji ? Math.random() * 14 + 16 : Math.random() * 16 + 14,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: isEmoji ? Math.random() * 0.3 + 0.15 : Math.random() * 0.2 + 0.08,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        icon,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.008,
      }
    })

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particlesRef.current) {
        p.x += p.speedX
        p.y += p.speedY
        p.rotation += p.rotationSpeed

        if (p.x < -30) p.x = canvas.width + 30
        if (p.x > canvas.width + 30) p.x = -30
        if (p.y < -30) p.y = canvas.height + 30
        if (p.y > canvas.height + 30) p.y = -30

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = p.opacity
        ctx.font = `${p.size}px sans-serif`
        ctx.fillStyle = p.color
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(p.icon, 0, 0)
        ctx.restore()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
