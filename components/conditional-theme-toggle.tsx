"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

export function ConditionalThemeToggle() {
  const pathname = usePathname();
  if (pathname === "/ejercicios" || pathname.startsWith("/ejercicios/mundos")) return null;
  return <ThemeToggle />;
}
