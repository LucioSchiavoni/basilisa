"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/ejercicios", label: "Mis Ejercicios" },
  { href: "/ejercicios/todos", label: "Todos los Ejercicios" },
];

export function EjerciciosNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b mb-8">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/ejercicios"
            ? pathname === "/ejercicios"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              isActive
                ? "text-foreground border-foreground"
                : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
