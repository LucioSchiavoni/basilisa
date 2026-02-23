import Link from "next/link"
import { LogIn } from "lucide-react"

export function HeroButtons() {
  return (
    <div className="flex flex-row items-center gap-2">
      <Link
        href="/login"
        className="flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium text-neutral-800 bg-white/90 hover:bg-white transition-colors duration-200"
      >
        <LogIn className="h-3.5 w-3.5" />
        <span>Iniciar</span>
      </Link>

      <Link
        href="/patient-login"
        className="flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium text-neutral-800 bg-white/90 hover:bg-white transition-colors duration-200"
      >
        <span>Soy lector</span>
      </Link>
    </div>
  )
}
