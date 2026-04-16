"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Map,
  ClipboardList,
  Trophy,
  User,
  LogOut,
  ScanText,
  ALargeSmall,
  X,
  Menu,
  CreditCard,
  TrendingUp,
  Calculator,
} from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
    href: "/ejercicios/matematicas",
    label: "Matemáticas",
    exact: true,
    accentColor: "#C73341",
    icon: Calculator,
  },
  {
    href: "/simplificador",
    label: "Simplificador",
    exact: true,
    accentColor: "#2E85C8",
    icon: ALargeSmall,
  },
  {
    href: "/analizador",
    label: "Analizador",
    exact: true,
    accentColor: "#7C5CBF",
    icon: ScanText,
  },
  {
    href: "/progreso",
    label: "Progreso",
    exact: true,
    accentColor: "#579F93",
    icon: TrendingUp,
  },
  {
    href: "/ranking",
    label: "Ranking",
    exact: true,
    accentColor: "#D3A021",
    icon: Trophy,
  },
  {
    href: "/planes",
    label: "Planes",
    exact: true,
    accentColor: "#2E85C8",
    icon: CreditCard,
  },
  {
    href: "/perfil",
    label: "Perfil",
    exact: true,
    accentColor: "#2E85C8",
    icon: User,
  },
];

export function PatientBottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isWorldDetailPage = pathname.startsWith("/ejercicios/mundos/");


  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {!isWorldDetailPage && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute top-0 left-0 z-60 flex h-14 w-12 items-center justify-center text-foreground/70 transition-colors hover:text-foreground lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu strokeWidth={1.8} className="h-5 w-5" />
        </button>
      )}

      <div
        className={cn(
          "fixed inset-0 z-70 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-80 flex h-full w-72 flex-col border-r border-border/60 bg-card transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ boxShadow: "4px 0 32px rgba(0,0,0,0.18)" }}
      >
        <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
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
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
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
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                  isActive ? "text-white shadow-sm" : "hover:bg-muted"
                )}
                style={isActive ? { background: item.accentColor } : undefined}
              >
                <Icon
                  className="h-5 w-5 shrink-0"
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
        <div className="space-y-3 px-3 py-3">
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border/70 px-4 py-3 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-5 w-5" strokeWidth={1.8} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <motion.nav
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        animate={{ width: expanded ? 224 : 64 }}
        transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
        className="fixed left-0 top-0 bottom-0 z-50 hidden lg:flex flex-col border-r border-border bg-card shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-center px-3 py-5 border-b border-border/50 shrink-0 overflow-hidden">
          {expanded ? (
            <Image src="/logos/Logotipo Lisa color simple.png" alt="LISA" width={72} height={36} className="object-contain" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <ALargeSmall className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
            </div>
          )}
        </div>
        <Separator />
        <div className="flex flex-1 flex-col gap-1 px-2 py-4 overflow-hidden">
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
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors overflow-hidden",
                  !expanded && "justify-center px-2 gap-0",
                  isActive ? "text-white shadow-sm" : "hover:bg-muted"
                )}
                style={isActive ? { background: item.accentColor } : undefined}
              >
                <Icon
                  className={cn("h-5 w-5 shrink-0", isActive ? "scale-110" : "")}
                  style={{ color: isActive ? "white" : item.accentColor }}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <motion.span
                  animate={{ maxWidth: expanded ? 160 : 0, opacity: expanded ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
                  className="overflow-hidden whitespace-nowrap"
                  style={{ color: isActive ? "white" : item.accentColor }}
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          })}
        </div>
        <Separator />
        <div className="space-y-3 px-2 py-3 shrink-0">
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
          <form action={logout}>
            <button
              type="submit"
              className={cn(
                "flex w-full items-center justify-center rounded-xl border border-border/70 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground overflow-hidden",
                expanded ? "gap-3 px-3 py-3" : "gap-0 px-2 py-3"
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.8} />
              <motion.span
                animate={{ maxWidth: expanded ? 160 : 0, opacity: expanded ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Cerrar sesión
              </motion.span>
            </button>
          </form>
        </div>
      </motion.nav>
    </>
  );
}
