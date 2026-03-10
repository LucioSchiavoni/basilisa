"use client";

import { useEffect, useState } from "react";
import { getScheme } from "../world-color-schemes";

export function BookOpenAnimation({
  worldName,
  displayName,
}: {
  worldName: string;
  displayName: string;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const scheme = getScheme(worldName);

  useEffect(() => {
    const t1 = setTimeout(() => setOpen(true), 60);
    const t2 = setTimeout(() => setDone(true), 850);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (done) return null;

  const half = {
    backgroundImage: `url(${scheme.background})`,
    backgroundSize: "200% 100%",
    backgroundRepeat: "no-repeat",
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 w-1/2"
        style={{
          ...half,
          backgroundPosition: "left center",
          transform: open ? "translateX(-102%)" : "translateX(0)",
          transition: "transform 0.72s cubic-bezier(0.76, 0, 0.24, 1)",
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
          transform: open ? "translateX(102%)" : "translateX(0)",
          transition: "transform 0.72s cubic-bezier(0.76, 0, 0.24, 1)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.4)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50" />

        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6"
          style={{
            opacity: open ? 0 : 1,
            transition: "opacity 0.2s ease",
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
          opacity: open ? 0 : 1,
          transition: "opacity 0.2s ease",
        }}
      />
    </div>
  );
}
