"use client"

import { useRef } from "react"
import {
    motion,
    useInView,
    type TargetAndTransition,
} from "framer-motion"

type RevealDirection = "up" | "down" | "left" | "right" | "none"

interface ScrollRevealProps {
    children: React.ReactNode
    direction?: RevealDirection
    delay?: number
    duration?: number
    distance?: number
    once?: boolean
    className?: string
    threshold?: number
}

const getInitial = (
    direction: RevealDirection,
    distance: number
): TargetAndTransition => {
    const base: TargetAndTransition = { opacity: 0 }
    if (direction === "up") return { ...base, y: distance }
    if (direction === "down") return { ...base, y: -distance }
    if (direction === "left") return { ...base, x: distance }
    if (direction === "right") return { ...base, x: -distance }
    return base
}

const getAnimate = (direction: RevealDirection): TargetAndTransition => {
    const base: TargetAndTransition = { opacity: 1 }
    if (direction === "up" || direction === "down") return { ...base, y: 0 }
    if (direction === "left" || direction === "right") return { ...base, x: 0 }
    return base
}

export function ScrollReveal({
    children,
    direction = "up",
    delay = 0,
    duration = 0.7,
    distance = 40,
    once = true,
    className,
    threshold = 0.3,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once, amount: threshold })

    return (
        <motion.div
            ref={ref}
            initial={getInitial(direction, distance)}
            animate={isInView ? getAnimate(direction) : getInitial(direction, distance)}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.1, 0.25, 1],
            }}
            className={className}
            style={{ background: "#ffffff" }}
        >
            {children}
        </motion.div>
    )
}