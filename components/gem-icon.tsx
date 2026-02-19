"use client";

import Lottie from "lottie-react";
import animationData from "@/public/lottie/Red Diamond.json";

export function GemIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <span className={className} style={{ display: "inline-flex", width: size, height: size, flexShrink: 0 }}>
      <Lottie animationData={animationData} loop autoplay style={{ width: size, height: size }} />
    </span>
  );
}
