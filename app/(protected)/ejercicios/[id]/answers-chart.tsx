"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MAX_SECONDS = 30;
const BAR_WIDTH = 64;

export type AnswersChartItem = {
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timedOut: boolean;
  timeSpentSeconds: number;
};

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function AnswersChart({
  answers,
}: {
  answers: AnswersChartItem[];
}) {
  if (!answers.length) return null;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const data = answers.map((a, i) => ({
    index: i + 1,
    time: Math.min(a.timeSpentSeconds, MAX_SECONDS),
    raw: a.timeSpentSeconds,
    correct: a.isCorrect,
    timedOut: a.timedOut,
    questionText: a.questionText,
    selectedAnswer: a.selectedAnswer,
    correctAnswer: a.correctAnswer,
  }));

  const chartWidth = Math.max(320, data.length * BAR_WIDTH);
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, answers.length]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -(BAR_WIDTH * 3) : BAR_WIDTH * 3,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background border shadow-sm hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background border shadow-sm hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div style={{ width: chartWidth, height: 180 }}>
            <BarChart
              width={chartWidth}
              height={180}
              data={data}
              margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="index"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                domain={[0, MAX_SECONDS]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}s`}
                ticks={[0, 10, 20, 30]}
              />
              <ReferenceLine
                y={30}
                stroke="#94a3b8"
                strokeDasharray="5 3"
                label={{
                  value: "30s",
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "#94a3b8",
                  dy: -2,
                }}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md max-w-[200px] space-y-1">
                      <p className="font-semibold leading-snug line-clamp-3 text-foreground">
                        {d.questionText}
                      </p>
                      {d.correct ? (
                        <p className={d.timedOut ? "text-yellow-600 font-medium" : "text-green-600 font-medium"}>
                          {d.correctAnswer}
                          {d.timedOut && <span className="ml-1 font-normal opacity-80">· Tiempo excedido</span>}
                        </p>
                      ) : (
                        <>
                          <p className={d.timedOut ? "text-yellow-600" : "text-red-500"}>
                            Tu respuesta:{" "}
                            <span className="font-medium">{d.selectedAnswer}</span>
                            {d.timedOut && <span className="ml-1 font-normal opacity-80">· Tiempo excedido</span>}
                          </p>
                          <p className="text-green-600">
                            Correcta:{" "}
                            <span className="font-medium">{d.correctAnswer}</span>
                          </p>
                        </>
                      )}
                      <p className="text-muted-foreground border-t pt-1 mt-1">{d.raw}s</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="time" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.timedOut ? "#eab308" : entry.correct ? "#22c55e" : "#ef4444"}
                    fillOpacity={0.82}
                  />
                ))}
              </Bar>
            </BarChart>
          </div>
        </div>
      </div>
    </div>
  );
}
