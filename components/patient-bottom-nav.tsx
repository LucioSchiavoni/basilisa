"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/ejercicios",
    label: "Ejercicios",
    exact: false,
    accentColor: "#C73341",
    icon: "/icons/worlds-icon.png",
    activeIcon: "/icons/worlds-open-icon.png",
  },
  {
    href: "/ejercicios/asignados",
    label: "Asignados",
    exact: true,
    accentColor: "#579F93",
    icon: "/icons/asignados-icon.png",
  },
  {
    href: "/ejercicios/ranking",
    label: "Ranking",
    exact: true,
    accentColor: "#D3A021",
    icon: "/icons/ranking-icon.png",
  },
  {
    href: "/ejercicios/perfil",
    label: "Perfil",
    exact: true,
    accentColor: "#2E85C8",
    icon: "/icons/profile-icon.png",
  },
];

export function PatientBottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div
          className="flex h-[108px] items-stretch rounded-t-md overflow-hidden"
          style={{ boxShadow: "0 -2px 12px rgba(0,0,0,0.2)" }}
        >
          {navItems.map((item) => {
            const otherExactMatch = navItems.some(
              (i) => i.href !== item.href && i.exact && pathname === i.href
            );
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && !otherExactMatch;
            const iconSrc = isActive && "activeIcon" in item ? item.activeIcon : item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col rounded-t-md transition-all duration-200",
                  isActive ? "flex-[2]" : "flex-1"
                )}
                style={{ background: item.accentColor }}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-t-md border-[3px] border-white/80 pointer-events-none z-20" />
                )}
                <div className={cn("relative flex-1 w-full overflow-hidden transition-all duration-200", isActive ? "scale-105" : "")}>
                  <Image src={iconSrc} alt={item.label} fill className="object-cover" />
                </div>
                <span
                  className={cn(
                    "text-center text-[9px] font-bold tracking-widest uppercase text-white py-1.5 shrink-0",
                    isActive ? "opacity-100" : "opacity-70"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: left sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 z-50 w-20 flex-col">
        {navItems.map((item) => {
          const otherExactMatch = navItems.some(
            (i) => i.href !== item.href && i.exact && pathname === i.href
          );
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && !otherExactMatch;
          const iconSrc = isActive && "activeIcon" in item ? item.activeIcon : item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col flex-1 w-full overflow-hidden transition-all duration-200"
              style={{ background: item.accentColor }}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-[6px] border-2 border-black/25 dark:border-white/60 pointer-events-none z-20" />
              )}
              <div className={cn("relative flex-1 w-full transition-all duration-200", isActive ? "scale-105" : "")}>
                <Image src={iconSrc} alt={item.label} fill className="object-cover" />
              </div>
              <span
                className={cn(
                  "relative z-10 text-center text-[9px] font-bold tracking-widest uppercase text-white py-1.5 shrink-0",
                  isActive ? "opacity-100" : "opacity-70"
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
