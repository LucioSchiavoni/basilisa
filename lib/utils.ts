import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const seg = seconds % 60
  if (min > 0 && seg > 0) return `${min} min ${seg} seg`
  if (min > 0) return `${min} min`
  return `${seg} seg`
}
