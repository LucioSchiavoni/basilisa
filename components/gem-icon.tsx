import Image from "next/image";

export function GemIcon({ size = 56, className }: { size?: number; className?: string }) {
  return (
    <span className={className} style={{ display: "inline-flex", width: size, height: size, flexShrink: 0, overflow: "hidden" }}>
      <Image src="/gems/gema.png" alt="gema" width={size * 3} height={size * 3} style={{ objectFit: "contain", transform: "scale(2.5)", transformOrigin: "center" }} />
    </span>
  );
}
