"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Map, ClipboardList, Trophy, User, LogOut, ScanText, ALargeSmall, X, Menu } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./theme-toggle";

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
    href: "/ranking",
    label: "Ranking",
    exact: true,
    accentColor: "#D3A021",
    icon: Trophy,
  },
  {
    href: "/perfil",
    label: "Perfil",
    exact: true,
    accentColor: "#2E85C8",
    icon: User,
  },
  {
    href: "/analizador",
    label: "Analizador",
    exact: true,
    accentColor: "#7C5CBF",
    icon: ScanText,
  },
  {
    href: "/simplificador",
    label: "Simplificador",
    exact: true,
    accentColor: "#2E85C8",
    icon: ALargeSmall,
  },
];

export function PatientBottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isWorldDetailPage = pathname.startsWith("/ejercicios/mundos/");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Mobile hamburger button ── */}
      {!isWorldDetailPage && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute top-0 left-0 z-60 lg:hidden flex items-center justify-center w-12 h-14 text-foreground/70 hover:text-foreground transition-colors"
          aria-label="Abrir menú"
        >
          <Menu strokeWidth={1.8} className="w-5 h-5" />
        </button>
      )}

      {/* ── Mobile drawer overlay ── */}
      <div
        className={cn(
          "fixed inset-0 z-70 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
      />

      {/* ── Mobile drawer panel ── */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 z-80 flex flex-col bg-card border-r border-border/60 lg:hidden transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ boxShadow: "4px 0 32px rgba(0,0,0,0.18)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <Image
            src="/logos/Logotipo Lisa color simple.png"
            alt="LISA"
            width={60}
            height={30}
            className="object-contain"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <nav className="flex flex-col flex-1 px-3 py-4 gap-1 overflow-y-auto">
          {navItems.map((item) => {
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
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200",
                  isActive ? "text-white shadow-sm" : "hover:bg-muted"
                )}
                style={isActive ? { background: item.accentColor } : undefined}
              >
                <Icon
                  className="w-5 h-5 shrink-0"
                  style={{ color: isActive ? "white" : item.accentColor }}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span style={{ color: isActive ? "white" : item.accentColor }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <Separator />
        <div className="px-3 py-3 flex justify-between items-center">
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
            >
              <LogOut className="w-5 h-5" strokeWidth={1.8} />
              Cerrar sesión
            </button>
          </form>
          <ThemeToggle/>
        </div>
      </aside>

      {/* ── Desktop left sidebar (unchanged) ── */}
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
                  isActive ? "text-white shadow-sm" : "hover:bg-muted"
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
