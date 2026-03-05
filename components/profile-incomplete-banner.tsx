import Link from "next/link"
import { UserRoundPen } from "lucide-react"

export function ProfileIncompleteBanner() {
  return (
    <Link
      href="/ejercicios/onboarding"
      className="group flex items-center gap-2.5 rounded-2xl px-3.5 py-2 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-500/25 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors duration-200 w-full lg:w-auto"
    >
      <div className="shrink-0 w-7 h-7 rounded-xl bg-amber-200/70 dark:bg-amber-500/20 flex items-center justify-center">
        <UserRoundPen className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
      </div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-1.5 min-w-0">
        <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 leading-tight">
          Completá tu perfil
        </span>
        <span className="hidden lg:inline text-xs text-amber-600 dark:text-amber-400/70">·</span>
        <span className="text-xs text-amber-700 dark:text-amber-400/80 leading-tight">
          Agregá tu nombre y fecha de nacimiento
        </span>
      </div>
      <span className="ml-auto shrink-0 text-xs font-semibold text-amber-700 dark:text-amber-400 group-hover:underline underline-offset-2 lg:hidden">
        Completar
      </span>
    </Link>
  )
}
