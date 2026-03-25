"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { LevelNode } from "./level-node"

type WorldData = {
  id: string
  name: string
  displayName: string
  difficultyLevel: number
  totalExercises: number
  completedExercises: number
}

const WORLD_IMAGES: Record<string, string> = {
  medieval: "/icons/Mundo-medieval-Icono.png",
  agua:     "/icons/oceano-icono.png",
  bosque:   "/icons/bosque-encantado-icono.png",
  hielo:    "/bg/hielo-bg.jpeg",
  fuego:    "/bg/fuego-bg.jpeg",
  cielo:    "/bg/cielo-bg.jpeg",
}

const ZIG_ZAG = [55, 35, 25, 45, 60, 50]

export function WorldPath({ worlds }: { worlds: WorldData[] }) {
  const firstActiveIndex = worlds.findIndex(
    (w) => w.totalExercises > 0 && w.completedExercises < w.totalExercises
  )
  const activeIndex = firstActiveIndex >= 0 ? firstActiveIndex : 0
  const [selectedId, setSelectedId] = useState<string | null>(worlds[0]?.id ?? null)

  return (
    <div className="relative flex flex-col items-center w-full max-w-md mx-auto py-8 px-4">
      <div className="relative w-full flex flex-col gap-6">
        {worlds.map((world, index) => {
          const image = WORLD_IMAGES[world.name]
          const isActive = index === activeIndex
          const position = ZIG_ZAG[index] ?? 50
          const isSelected = selectedId === world.id

          return (
            <div key={world.id} className="relative w-full flex">
              <div
                className="relative flex flex-col items-center"
                style={{ marginLeft: `${position}%`, transform: "translateX(-50%)" }}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      key="bubble"
                      initial={{ opacity: 0, scale: 0.5, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5, y: 16 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 10,
                        mass: 0.5,
                      }}
                      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10"
                      style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.18))" }}
                    >
                      <Link href={`/ejercicios/mundos/${world.id}`}>
                        <div className="relative bg-card text-cyan-500 border-2 border-cyan-400 font-semibold text-sm px-4 py-2 rounded-2xl whitespace-nowrap cursor-pointer select-none">
                          Comenzar
                          <span
                            className="absolute top-full left-[44%] -translate-x-1/2 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[10px] border-t-cyan-400"
                          />
                          <span
                            className="absolute left-[44%] -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[8px]"
                            style={{ top: "calc(100% - 2px)", borderTopColor: "hsl(var(--card))" }}
                          />
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                <LevelNode
                  name={world.displayName}
                  imageUrl={image ?? ""}
                  href={`/ejercicios/mundos/${world.id}`}
                  isActive={isActive}
                  onClick={(e) => {
                    if (!isSelected) {
                      e.preventDefault()
                      setSelectedId(world.id)
                    }
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
