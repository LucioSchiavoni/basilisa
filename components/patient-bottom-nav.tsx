"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Map, ClipboardList, Trophy, User, LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/actions";

const navItems = [
  {
    href: "/ejercicios",
    label: "Mundos",
    exact: false,
    accentColor: "#C73341",
    icon: Map,
  },
  {
    href: "/ejercicios/asignados",
    label: "Asignados",
    exact: true,
    accentColor: "#579F93",
    icon: ClipboardList,
  },
  {
    href: "/ejercicios/ranking",
    label: "Ranking",
    exact: true,
    accentColor: "#D3A021",
    icon: Trophy,
  },
  {
    href: "/ejercicios/perfil",
    label: "Perfil",
    exact: true,
    accentColor: "#2E85C8",
    icon: User,
  },
];

export function PatientBottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="mx-3 mb-4">
          <div
            className="flex items-center h-[68px] rounded-2xl bg-card/85 border border-border/60 backdrop-blur-xl dark:bg-black/75 dark:border-white/10"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.22), 0 1.5px 0 rgba(255,255,255,0.08) inset" }}
          >
            {navItems.map((item, i) => {
              const otherExactMatch = navItems.some(
                (it) => it.href !== item.href && it.exact && pathname === it.href
              );
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href) && !otherExactMatch;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5"
                >
                  {i > 0 && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-border/40 dark:bg-white/10" />
                  )}
                  <div
                    className={cn(
                      "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200",
                      isActive ? "shadow-md scale-105" : "opacity-50 hover:opacity-80"
                    )}
                    style={isActive ? { background: item.accentColor } : undefined}
                  >
                    <Icon
                      className="w-5 h-5 transition-all duration-200"
                      style={{ color: isActive ? "white" : item.accentColor }}
                      strokeWidth={isActive ? 2.5 : 2.2}
                    />
                    <span
                      className="text-[10px] font-extrabold tracking-wider uppercase leading-none"
                      style={{ color: isActive ? "white" : item.accentColor }}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop: left sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 z-50 w-56 flex-col bg-card border-r border-border shadow-sm">
        <div className="flex items-center justify-center px-5 py-5">
          <Image
            src="/logos/Logotipo Lisa color simple.png"
            alt="LISA"
            width={72}
            height={36}
            className="object-contain"
          />
        </div>
        <Separator />
        <div className="flex flex-col flex-1 px-3 py-4 gap-1">
          {navItems.map((item) => {
            const otherExactMatch = navItems.some(
              (i) => i.href !== item.href && i.exact && pathname === i.href
            );
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && !otherExactMatch;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200",
                  isActive
                    ? "text-white shadow-sm"
                    : "hover:bg-muted"
                )}
                style={isActive ? { background: item.accentColor } : undefined}
              >
                <Icon
                  className={cn("w-5 h-5 transition-transform duration-200", isActive ? "scale-110" : "")}
                  style={{ color: isActive ? "white" : item.accentColor }}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span style={{ color: isActive ? "white" : item.accentColor }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
        <Separator />
        <div className="px-3 py-3">
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
            >
              <LogOut className="w-5 h-5" strokeWidth={1.8} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </nav>
    </>
  );
}
