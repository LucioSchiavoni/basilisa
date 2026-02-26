"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { GemIcon } from "@/components/gem-icon";
import { cn } from "@/lib/utils";

function useCountUp(target: number, duration = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target <= 0) { setCount(0); return; }
    setCount(0);
    const start = Date.now();
    let raf: number;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return count;
}

type Props = {
  isCompleting: boolean;
  gemsAwarded: number | null;
  className?: string;
};

export function GemsCard({ isCompleting, gemsAwarded, className }: Props) {
  const count = useCountUp(gemsAwarded ?? 0);
  const hasGems = !isCompleting && !!gemsAwarded && gemsAwarded > 0;

  return (
    <div
      className={cn(
        "rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border border-yellow-200 dark:border-yellow-800 p-5 flex flex-col justify-center gap-2",
        className
      )}
    >
      {isCompleting ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
          <p className="text-sm text-muted-foreground">Calculando...</p>
        </div>
      ) : hasGems ? (
        <>
          <GemIcon
            size={22}
            className="animate-in zoom-in-50 duration-500"
          />
          <p className="text-2xl font-bold tabular-nums leading-none">
            +{count}
          </p>
          <p className="text-xs text-muted-foreground">Gemas ganadas</p>
        </>
      ) : gemsAwarded !== null ? (
        <>
          <GemIcon size={20} className="opacity-30" />
          <p className="text-sm text-muted-foreground">Sin gemas esta vez</p>
        </>
      ) : null}
    </div>
  );
}
