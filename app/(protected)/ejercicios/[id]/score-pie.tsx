"use client";

function getScoreColor(pct: number): string {
  if (pct === 100) return "#22c55e";
  if (pct >= 80) return "#4ade80";
  if (pct >= 60) return "#a3e635";
  if (pct >= 40) return "#facc15";
  return "#f97316";
}

export function ScorePie({ percentage }: { percentage: number }) {
  const color = getScoreColor(percentage);
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative shrink-0"
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: `conic-gradient(${color} ${percentage}%, rgba(148,163,184,0.2) ${percentage}%)`,
        }}
      >
        <div className="absolute inset-[15px] rounded-full bg-muted flex flex-col items-center justify-center">
          <span className="text-2xl font-bold leading-none tabular-nums" style={{ color }}>
            {percentage}%
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">Aciertos</span>
    </div>
  );
}
