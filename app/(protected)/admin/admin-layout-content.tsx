"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { logout } from "@/app/(auth)/actions";
import { AdminBottomNav } from "@/components/admin-bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface AdminLayoutContentProps {
  children: React.ReactNode;
  profile: {
    full_name?: string | null;
  } | null;
  user: {
    email?: string | null;
  } | null;
}

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    exact: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    href: "/admin/ejercicios",
    label: "Ejercicios",
    exact: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
        <line x1="10" x2="8" y1="9" y2="9" />
      </svg>
    ),
  },
  {
    href: "/admin/pacientes",
    label: "Seguimiento",
    exact: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
        <path d="m7 11 4-4 4 4 5-5" />
      </svg>
    ),
  },
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    exact: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/admin/analizador",
    label: "Analizador",
    exact: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <path d="M7 8h8" />
        <path d="M7 12h10" />
        <path d="M7 16h6" />
      </svg>
    ),
  },
  {
    href: "/admin/simplificador",
    label: "Simplificador",
    exact: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <path d="M4 7h16" />
        <path d="M4 12h10" />
        <path d="M4 17h6" />
      </svg>
    ),
  },
];

export function AdminLayoutContent({ children, profile, user }: AdminLayoutContentProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const isPatientDetailPage = pathname.match(/^\/admin\/pacientes\/[a-zA-Z0-9-]+$/);
  const isSimplificador = pathname.startsWith("/admin/simplificador");
  const displayName = profile?.full_name || user?.email || "?";
  const initial = displayName[0].toUpperCase();

  return (
    <div className="admin-layout min-h-screen lg:flex bg-background">
      <motion.aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        animate={{ width: expanded ? 256 : 56 }}
        transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
        className="hidden lg:flex lg:flex-col lg:fixed lg:top-0 lg:left-0 lg:h-screen bg-card border-r z-50 overflow-hidden"
      >
        <div className="shrink-0 border-b border-border/50 px-3 py-4 flex items-center gap-3 overflow-hidden">
          <div className="shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
            {initial}
          </div>
          <motion.div
            animate={{ maxWidth: expanded ? 192 : 0, opacity: expanded ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
            className="overflow-hidden whitespace-nowrap"
          >
            <p className="text-sm font-semibold text-foreground truncate leading-tight">{displayName}</p>
          </motion.div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-hidden">
          {navItems.map((item) => {
            const otherExact = navItems.some(
              (it) => it.href !== item.href && it.exact && pathname === it.href
            );
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && !otherExact;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors overflow-hidden",
                  !expanded && "justify-center px-2 gap-0",
                  isActive ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {item.icon}
                <motion.div
                  animate={{ maxWidth: expanded ? 192 : 0, opacity: expanded ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
                  className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
                >
                  <span className="text-sm">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 mt-auto border-t px-2 py-4 space-y-3 overflow-hidden">
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
          <form action={logout}>
            <button
              type="submit"
              className={cn(
                "flex w-full items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors overflow-hidden",
                expanded ? "gap-3 px-3 py-2" : "gap-0 px-2 py-2"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <motion.span
                animate={{ maxWidth: expanded ? 192 : 0, opacity: expanded ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
                className="overflow-hidden whitespace-nowrap text-sm"
              >
                Cerrar Sesión
              </motion.span>
            </button>
          </form>
        </div>
      </motion.aside>

      <div className={cn("flex-1 flex flex-col lg:hidden", (isPatientDetailPage || isSimplificador) && "hidden")}>
        <div className="relative flex items-center justify-center p-4 border-b bg-card min-h-14">
          <div className="absolute left-0 top-0 h-full flex items-center">
            <AdminBottomNav />
          </div>
          <span className="text-base font-semibold text-foreground truncate max-w-[70%] mx-auto">
            {displayName}
          </span>
        </div>
      </div>
      {isSimplificador && (
        <div className="fixed top-0 left-0 z-50 lg:hidden">
          <AdminBottomNav />
        </div>
      )}

      <main className="flex-1 p-4 lg:ml-14 lg:p-8 lg:pb-8">
        <div className="max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
