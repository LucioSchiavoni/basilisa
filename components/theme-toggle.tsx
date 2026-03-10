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
      role="switch"
      aria-checked={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Cambiar tema"
      className="relative inline-flex h-8 w-[3.75rem] cursor-pointer items-center rounded-full transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0d1b3e 0%, #1a2f6b 100%)"
          : "linear-gradient(135deg, #7dd3fc 0%, #bae6fd 100%)",
        boxShadow: isDark
          ? "inset 0 2px 6px rgba(0,0,0,0.5), 0 0 0 1.5px rgba(255,255,255,0.09)"
          : "inset 0 2px 4px rgba(0,100,200,0.15), 0 0 0 1.5px rgba(0,0,0,0.08)",
      }}
    >
      {/* Decorative dots — estrellas en oscuro, nubes en claro */}
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
        <span
          className="absolute top-[7px] left-[10px] h-[3px] w-[3px] rounded-full bg-white transition-opacity duration-500"
          style={{ opacity: isDark ? 0.85 : 0 }}
        />
        <span
          className="absolute top-[14px] left-[16px] h-[2px] w-[2px] rounded-full bg-white transition-opacity duration-500"
          style={{ opacity: isDark ? 0.55 : 0, transitionDelay: "60ms" }}
        />
        <span
          className="absolute bottom-[7px] left-[11px] h-[2px] w-[2px] rounded-full bg-white transition-opacity duration-500"
          style={{ opacity: isDark ? 0.7 : 0, transitionDelay: "120ms" }}
        />
        {/* Nube minimalista en modo claro */}
        <span
          className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[10px] leading-none transition-opacity duration-500"
          style={{ opacity: isDark ? 0 : 0.55 }}
        >
          ☁️
        </span>
      </span>

      {/* Thumb deslizante */}
      <span
        className="pointer-events-none absolute flex h-6 w-6 items-center justify-center rounded-full text-sm transition-all duration-500"
        style={{
          left: isDark ? "2rem" : "0.25rem",
          background: isDark
            ? "linear-gradient(145deg, #c8d4f0 0%, #e8eeff 100%)"
            : "linear-gradient(145deg, #fde68a 0%, #fbbf24 100%)",
          boxShadow: isDark
            ? "0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5)"
            : "0 2px 8px rgba(0,0,0,0.18), 0 0 14px rgba(251,191,36,0.45), inset 0 1px 0 rgba(255,255,255,0.7)",
        }}
      >
        <span style={{ lineHeight: 1, fontSize: "0.8rem" }}>
          {isDark ? "🌙" : "☀️"}
        </span>
      </span>
    </button>
  );
}
