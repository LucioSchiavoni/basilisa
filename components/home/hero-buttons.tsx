import Link from "next/link"
import { LogIn } from "lucide-react"

export function HeroButtons() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
      <Link
        href="/login"
        className="group relative flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-[0_4px_0_0_hsl(225,100%,50%)] transition-all duration-200 hover:translate-y-[2px] hover:shadow-[0_2px_0_0_hsl(225,100%,50%)] active:translate-y-[3px] active:shadow-[0_1px_0_0_hsl(225,100%,50%)] w-full sm:w-auto sm:min-w-[140px]"
        style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, sans-serif' }}
      >
        <LogIn className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        <span>Iniciar</span>
      </Link>

      <Link
        href="/patient-login"
        className="group relative flex items-center justify-center gap-2 rounded-xl bg-secondary px-8 py-3 text-sm font-semibold text-secondary-foreground shadow-[0_4px_0_0_hsl(0,85%,50%)] transition-all duration-200 hover:translate-y-[2px] hover:shadow-[0_2px_0_0_hsl(0,85%,50%)] active:translate-y-[3px] active:shadow-[0_1px_0_0_hsl(0,85%,50%)] w-full sm:w-auto sm:min-w-[140px]"
        style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, sans-serif' }}
      >
        <span className="text-base leading-none">📖</span>
        <span>Soy lector</span>
      </Link>
    </div>
  )
}
