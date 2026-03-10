"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Cambiar tema"
      className="relative inline-flex overflow-hidden rounded-full border border-black/10 shadow-sm outline-none dark:border-white/15"
    >
      <span className="flex h-[32px] w-[36px] items-center justify-center bg-sky-300 text-[16px]">
        🌤️
      </span>
      <span className="relative flex h-[32px] w-[36px] items-center justify-center bg-[#0f1b3d] text-[16px]">
        <span className="absolute top-[4px] left-[6px] text-[6px] leading-none text-white/70">✦</span>
        <span className="absolute bottom-[5px] right-[6px] text-[5px] leading-none text-white/50">✦</span>
        <span className="absolute top-[12px] right-[8px] text-[4px] leading-none text-white/60">●</span>
        🌙
      </span>
      <span
        className={`absolute top-0 h-[32px] w-[44px] rounded-full bg-background shadow-md transition-transform duration-200 ${
          isDark ? "-left-[4px] translate-x-0" : "-left-[4px] translate-x-[32px]"
        }`}
      />
    </button>
  );
}
