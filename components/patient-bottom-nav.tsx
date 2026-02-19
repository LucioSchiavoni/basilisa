"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWorldTheme } from "@/components/world-theme-context";

const navItems = [
  {
    href: "/ejercicios",
    label: "Ejercicios",
    exact: true,
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
    href: "/completar-perfil",
    label: "Perfil",
    exact: false,
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
  const { theme } = useWorldTheme();

  const isWorldPage =
    pathname === "/ejercicios" || pathname.startsWith("/ejercicios/mundos");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-3">
      <div className="max-w-sm mx-auto">
        {isWorldPage ? (
          <div
            className="flex h-[68px] items-center justify-around rounded-2xl px-1"
            style={{
              background: theme.navGradient,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 -1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center gap-0.5 px-4 py-2"
                >
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.07)" }}
                    />
                  )}
                  <div
                    className={cn("relative transition-all duration-200", isActive ? "scale-110" : "opacity-60")}
                    style={isActive ? { color: theme.accentColor } : { color: "white" }}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={cn("text-[9px] font-bold tracking-widest uppercase transition-all duration-200", isActive ? "opacity-100" : "opacity-40 text-white")}
                    style={isActive ? { color: theme.accentColor } : undefined}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <div
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full"
                      style={{ background: theme.accentColor }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex h-[68px] items-center justify-around rounded-2xl px-1 bg-card border border-border shadow-lg backdrop-blur-xl">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center gap-0.5 px-4 py-2"
                >
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-muted" />
                  )}
                  <div
                    className={cn("relative transition-all duration-200", isActive ? "scale-110" : "opacity-40")}
                    style={isActive ? { color: theme.accentColor } : undefined}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={cn("text-[9px] font-bold tracking-widest uppercase transition-all duration-200 text-foreground", isActive ? "opacity-100" : "opacity-40")}
                    style={isActive ? { color: theme.accentColor } : undefined}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <div
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full"
                      style={{ background: theme.accentColor }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
