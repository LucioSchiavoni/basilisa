import confetti from "canvas-confetti"

export function fireWinConfetti() {
  const isDesktop = window.innerWidth >= 768
  const timers: ReturnType<typeof setTimeout>[] = []

  if (isDesktop) {
    confetti({ particleCount: 350, angle: 60, spread: 75, startVelocity: 60, origin: { x: 0, y: 0.6 } })
    confetti({ particleCount: 350, angle: 120, spread: 75, startVelocity: 60, origin: { x: 1, y: 0.6 } })
    timers.push(setTimeout(() => {
      confetti({ particleCount: 250, angle: 60, spread: 65, startVelocity: 50, origin: { x: 0, y: 0.6 } })
      confetti({ particleCount: 250, angle: 120, spread: 65, startVelocity: 50, origin: { x: 1, y: 0.6 } })
    }, 300))
    timers.push(setTimeout(() => {
      confetti({ particleCount: 150, angle: 60, spread: 55, startVelocity: 40, origin: { x: 0, y: 0.6 } })
      confetti({ particleCount: 150, angle: 120, spread: 55, startVelocity: 40, origin: { x: 1, y: 0.6 } })
    }, 600))
  } else {
    confetti({ particleCount: 250, angle: 60, spread: 70, startVelocity: 55, origin: { x: 0, y: 0.65 } })
    confetti({ particleCount: 250, angle: 120, spread: 70, startVelocity: 55, origin: { x: 1, y: 0.65 } })
    timers.push(setTimeout(() => {
      confetti({ particleCount: 180, angle: 60, spread: 60, startVelocity: 45, origin: { x: 0, y: 0.65 } })
      confetti({ particleCount: 180, angle: 120, spread: 60, startVelocity: 45, origin: { x: 1, y: 0.65 } })
    }, 300))
  }

  return () => timers.forEach(clearTimeout)
}
