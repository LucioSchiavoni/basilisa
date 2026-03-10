"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getScheme } from "../world-color-schemes";

export function WorldBackButton({
  worldName,
  displayName,
}: {
  worldName: string;
  displayName: string;
}) {
  const router = useRouter();
  const [closing, setClosing] = useState(false);
  const [panelsIn, setPanelsIn] = useState(false);
  const scheme = getScheme(worldName);

  const handleBack = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => setPanelsIn(true), 30);
    setTimeout(
      () =>
        router.push(
          `/ejercicios?from=${encodeURIComponent(worldName)}&name=${encodeURIComponent(displayName)}`
        ),
      780
    );
  };

  const half: React.CSSProperties = {
    backgroundImage: `url(${scheme.background})`,
    backgroundSize: "200% 100%",
    backgroundRepeat: "no-repeat",
  };

  return (
    <>
      {closing && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 w-1/2"
            style={{
              ...half,
              backgroundPosition: "left center",
              transform: panelsIn ? "translateX(0)" : "translateX(-102%)",
              transition: "transform 0.68s cubic-bezier(0.76, 0, 0.24, 1)",
              boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          </div>

          <div
            className="absolute inset-y-0 right-0 w-1/2"
            style={{
              ...half,
              backgroundPosition: "right center",
              transform: panelsIn ? "translateX(0)" : "translateX(102%)",
              transition: "transform 0.68s cubic-bezier(0.76, 0, 0.24, 1)",
              boxShadow: "-4px 0 24px rgba(0,0,0,0.4)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50" />
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6"
              style={{
                opacity: panelsIn ? 1 : 0,
                transition: "opacity 0.25s ease 0.42s",
              }}
            >
              <div
                className="w-12 h-px"
                style={{ background: scheme.accentColor, opacity: 0.7 }}
              />
              <span
                className="font-serif font-bold text-white text-center leading-tight drop-shadow-lg"
                style={{ fontSize: "clamp(18px, 4vw, 26px)" }}
              >
                {displayName}
              </span>
              <div
                className="w-12 h-px"
                style={{ background: scheme.accentColor, opacity: 0.7 }}
              />
            </div>
          </div>

          <div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3"
            style={{
              background: "rgba(0,0,0,0.6)",
              opacity: panelsIn ? 1 : 0,
              transition: "opacity 0.2s ease 0.52s",
            }}
          />
        </div>
      )}

      <button
        onClick={handleBack}
        className="relative z-50 inline-flex items-center gap-1.5 text-sm font-semibold mb-6 px-3 py-1.5 rounded-xl transition-opacity"
        style={{ color: "#0B1926", background: "white", opacity: closing ? 0 : 1 }}
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>
    </>
  );
}
