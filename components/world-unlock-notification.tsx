"use client";

import { useEffect, useState } from "react";
import { getScheme } from "@/app/(protected)/ejercicios/(browse)/mundos/world-color-schemes";

type Props = {
  worldName: string;
  worldDisplayName: string;
  onDismiss: () => void;
};

export function WorldUnlockNotification({ worldName, worldDisplayName, onDismiss }: Props) {
  const scheme = getScheme(worldName);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
      onClick={handleDismiss}
    >
      <div
        className="w-full max-w-xs rounded-3xl overflow-hidden transition-all duration-300"
        style={{
          transform: visible ? "scale(1) translateY(0)" : "scale(0.92) translateY(16px)",
          boxShadow: `0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08), 0 0 40px ${scheme.glow}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="h-1.5 w-full"
          style={{ background: scheme.buttonGradient }}
        />

        <div
          className="flex flex-col items-center gap-5 px-8 py-8 text-center"
          style={{ background: "rgba(10,12,20,0.92)" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{
              background: `${scheme.particles}18`,
              border: `1.5px solid ${scheme.particles}40`,
              boxShadow: `0 0 20px ${scheme.glow}`,
            }}
          >
            🔓
          </div>

          <div className="space-y-1.5">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: scheme.particles }}
            >
              ¡Mundo desbloqueado!
            </p>
            <h2 className="text-2xl font-extrabold text-white leading-tight">
              {worldDisplayName}
            </h2>
            <p className="text-sm text-white/50 leading-relaxed pt-1">
              Completaste todos los ejercicios.<br />¡Un nuevo mundo te espera!
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-150 active:scale-95"
            style={{
              background: scheme.buttonGradient,
              boxShadow: `0 4px 20px ${scheme.particles}35`,
            }}
          >
            ¡Explorarlo!
          </button>
        </div>
      </div>
    </div>
  );
}
