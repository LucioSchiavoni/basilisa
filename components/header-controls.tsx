"use client";

import { usePathname } from "next/navigation";
import { GemBadge } from "@/components/gem-badge";
import { ThemeToggle } from "@/components/theme-toggle";

export function HeaderControls({ totalGems }: { totalGems: number }) {
  const pathname = usePathname();
  const isWorldPage = pathname.startsWith("/ejercicios/mundos/");

  if (isWorldPage) return null;

  return (
    <>
      <div className="flex lg:hidden">
        <GemBadge totalGems={totalGems} size={56} textClass="text-lg" />
      </div>
      <div className="flex items-center gap-3 lg:gap-6">
        <div className="hidden lg:flex">
          <GemBadge totalGems={totalGems} size={56} textClass="text-xl" />
        </div>
        <ThemeToggle />
      </div>
    </>
  );
}
