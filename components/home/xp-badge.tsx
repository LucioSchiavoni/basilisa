"use client"

import { Star, Zap } from "lucide-react"

export function XpBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-accent-foreground shadow-lg shadow-accent/30 animate-pop-in">
      <Zap className="h-4 w-4 fill-current" />
      <span className="font-heading text-sm font-extrabold tracking-wide">
        {'+ 100 XP al empezar'}
      </span>
      <Star className="h-4 w-4 fill-current" />
    </div>
  )
}
