"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GemIcon } from "@/components/gem-icon";

export function GemBadge({ totalGems, size, textClass }: { totalGems: number; size: number; textClass: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-0.5 cursor-pointer outline-none focus:outline-none"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <GemIcon size={size} />
          <span className={`${textClass} font-semibold text-foreground dark:text-white font-[family-name:var(--font-fredoka)]`}>
            {totalGems}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-52 p-3"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        sideOffset={8}
      >
        <div className="flex items-center gap-2 mb-3">
          <GemIcon size={36} />
          <div>
            <p className="text-xs text-muted-foreground">Tienes</p>
            <p className="text-lg font-semibold leading-tight font-[family-name:var(--font-fredoka)]">
              {totalGems} gemas
            </p>
          </div>
        </div>
        <button
          className="w-full text-sm font-semibold text-white rounded-md px-3 py-1.5 cursor-pointer transition-opacity hover:opacity-90 active:opacity-80"
          style={{ backgroundColor: "#C73341" }}
          onClick={() => {
            setOpen(false);
            router.push("/ranking");
          }}
        >
          Ir al ranking
        </button>
      </PopoverContent>
    </Popover>
  );
}
