"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, RotateCcw } from "lucide-react";
import type { WorldConfig } from "@/lib/worlds";

type Props = {
  worldBg: React.ReactNode;
  worldConfig: WorldConfig | null;
  reviewQueueLength: number;
  backHref: string;
  onContinue: () => void;
};

export function PhaseReviewIntro({
  worldBg,
  worldConfig,
  reviewQueueLength,
  backHref,
  onContinue,
}: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      {worldBg}
      <header className="p-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm transition-colors"
          style={{ color: "rgba(255,255,255,0.70)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-6 pt-0">
        <div className="w-full max-w-lg text-center space-y-6">
          {worldConfig ? (
            <>
              <div className="flex justify-center -mt-4 -mb-1">
                <Image
                  src={worldConfig.characterImage}
                  alt=""
                  width={200}
                  height={200}
                  className="w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] object-contain animate-fade-in-up drop-shadow-2xl"
                />
              </div>
              <div
                className="rounded-2xl px-6 py-5 text-center mx-auto max-w-sm"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.20)",
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <RotateCcw className="h-5 w-5 text-amber-300" />
                  <span className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                    Repaso
                  </span>
                </div>
                <p className="text-lg font-bold text-white leading-snug">
                  ¡Vamos a corregir las respuestas incorrectas!
                </p>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.70)" }}>
                  {reviewQueueLength} pregunta{reviewQueueLength !== 1 && "s"} para repasar
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 px-6 py-8 text-center space-y-3">
              <RotateCcw className="h-10 w-10 text-amber-500 mx-auto" />
              <h2 className="text-xl font-bold text-gray-900">
                ¡Vamos a corregir las respuestas incorrectas!
              </h2>
              <p className="text-sm text-muted-foreground">
                {reviewQueueLength} pregunta{reviewQueueLength !== 1 && "s"} para repasar
              </p>
            </div>
          )}
          <Button
            size="lg"
            className="w-full max-w-xs text-base h-12"
            onClick={onContinue}
          >
            Continuar
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </main>
    </div>
  );
}
