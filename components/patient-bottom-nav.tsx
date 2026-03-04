"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_BG = "linear-gradient(135deg, rgba(20,55,90,0.95) 0%, rgba(12,35,60,0.98) 100%)";

const navItems = [
  {
    href: "/ejercicios",
    label: "Ejercicios",
    exact: true,
    accentColor: "#C73341",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    href: "/ejercicios/asignados",
    label: "Asignados",
    exact: true,
    accentColor: "#579F93",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </svg>
    ),
  },
  {
    href: "/ejercicios/ranking",
    label: "Ranking",
    exact: true,
    accentColor: "#D3A021",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
      </svg>
    ),
  },
  {
    href: "/completar-perfil",
    label: "Perfil",
    exact: false,
    accentColor: "#2E85C8",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="5" />
        <path d="M20 21a8 8 0 0 0-16 0" />
      </svg>
    ),
  },
];

export function PatientBottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div
          className="flex h-[64px] items-center"
          style={{ boxShadow: "0 -2px 12px rgba(0,0,0,0.2)" }}
        >
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 py-2 h-full transition-all duration-200",
                  isActive ? "flex-[2]" : "flex-1"
                )}
                style={{ background: item.accentColor }}
              >
                <div
                  className={cn("relative transition-all duration-200", isActive ? "scale-110" : "")}
                  style={{ color: "#ffffff" }}
                >
                  {item.icon}
                </div>
                {isActive && (
                  <span className="text-[9px] font-bold tracking-widest uppercase relative text-white">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: left sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 z-50 w-20 flex-col">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-1.5 flex-1 w-full transition-all duration-200"
              style={{ background: item.accentColor }}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-[6px] border-2 border-black/25 dark:border-white/60 pointer-events-none" />
              )}
              <div
                className={cn("relative transition-all duration-200", isActive ? "scale-110" : "")}
                style={{ color: "#ffffff" }}
              >
                {item.icon}
              </div>
              <span
                className={cn(
                  "text-[9px] font-bold tracking-widest uppercase text-white transition-all duration-200",
                  isActive ? "opacity-100" : "opacity-60"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
