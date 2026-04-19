"use client";

import { usePathname } from "next/navigation";
import { GemBadge } from "@/components/gem-badge";

export function HeaderControls({ totalGems }: { totalGems: number }) {
  const pathname = usePathname();
  const isWorldPage = pathname.startsWith("/ejercicios/mundos/");
  const isSimplificador = pathname === "/simplificador";
  const isMatematicas = pathname === "/ejercicios/matematicas";

  if (isWorldPage || isSimplificador || isMatematicas) return null;

  return (
    <>
      <div className="lg:hidden">
        <GemBadge totalGems={totalGems} size={56} textClass="text-lg" />
      </div>
      <div className="hidden lg:flex items-center">
        <GemBadge totalGems={totalGems} size={56} textClass="text-xl" />
      </div>
    </>
  );
}
