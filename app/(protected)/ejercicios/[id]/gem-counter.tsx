"use client";

import { useEffect, useState, useRef } from "react";
import { GemIcon } from "@/components/gem-icon";

type Props = {
  initialGems: number;
  gemsAwarded: number | null;
  isCompleting: boolean;
};

export function GemCounter({ initialGems, gemsAwarded, isCompleting }: Props) {
  const [displayed, setDisplayed] = useState(initialGems);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (gemsAwarded === null || isCompleting) return;

    const scheduleHide = () => {
      hideTimerRef.current = setTimeout(() => {
        setExiting(true);
        setTimeout(() => setGone(true), 900);
      }, 4500);
    };

    if (gemsAwarded <= 0) {
      scheduleHide();
      return;
    }

    const duration = 2000;
    const start = Date.now();
    const startValue = initialGems;
    let raf: number;

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(startValue + eased * gemsAwarded));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        scheduleHide();
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [gemsAwarded, isCompleting, initialGems]);

  if (gone) return null;

  return (
    <div
      className={`fixed top-4 left-4 z-50 transition-all duration-700 ${
        visible && !exiting ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-yellow-200 dark:border-yellow-800 rounded-2xl px-4 py-2.5 shadow-lg">
        <GemIcon size={18} />
        <span className="text-base font-bold tabular-nums">{displayed}</span>
        {gemsAwarded !== null && gemsAwarded > 0 && !isCompleting && !exiting && (
          <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
            +{gemsAwarded}
          </span>
        )}
      </div>
    </div>
  );
}
