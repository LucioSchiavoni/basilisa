"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LabelList,
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Flame, Trophy, BookOpen, Target, Calendar } from "lucide-react";
import type { WeeklyProgressRow, PeakWeek } from "@/app/(protected)/(patient)/progreso/actions";
import { ActivityHeatmap } from "@/app/(protected)/(patient)/progreso/activity-heatmap";

const TYPE_COLORS: Record<string, string> = {
  timed_reading: "#10b981",
  reading_comprehension: "#6b9fd4",
  letter_gap: "#f59e0b",
  multiple_choice: "#9b8ec4",
};

type AccuracyByTypeRow = {
  exercise_type: string;
  display_name: string;
  avg_accuracy: number;
  total_sessions: number;
};

type Props = {
  weeklyProgress: WeeklyProgressRow[];
  peakWeek: PeakWeek;
  accuracyByType: AccuracyByTypeRow[];
  expectedPpm: number;
  activityMap: Record<string, number>;
  currentStreak: number;
  bestStreak: number;
  totalCompleted: number;
  avgScore: number;
  activeDays: number;
};

type Tab = "actividad" | "lectura" | "precision";

const TABS: { id: Tab; label: string }[] = [
  { id: "actividad", label: "🔥 Actividad" },
  { id: "lectura", label: "📖 Lectura" },
  { id: "precision", label: "🎯 Precisión" },
];

export function ProgressDashboard({
  weeklyProgress,
  peakWeek,
  accuracyByType,
  expectedPpm,
  activityMap,
  currentStreak,
  bestStreak,
  totalCompleted,
  avgScore,
  activeDays,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("actividad");

  return (
    <div className="space-y-4" style={{ fontFamily: "var(--font-lexend)" }}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tu progreso</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Estadísticas de tu actividad</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-emerald-500 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "actividad" && (
        <TabActividad
          activityMap={activityMap}
          currentStreak={currentStreak}
          bestStreak={bestStreak}
          totalCompleted={totalCompleted}
          avgScore={avgScore}
          activeDays={activeDays}
        />
      )}

      {activeTab === "lectura" && (
        <TabLectura
          weeklyProgress={weeklyProgress}
          peakWeek={peakWeek}
          expectedPpm={expectedPpm}
        />
      )}

      {activeTab === "precision" && (
        <TabPrecision accuracyByType={accuracyByType} />
      )}
    </div>
  );
}

function TabActividad({
  activityMap,
  currentStreak,
  bestStreak,
  totalCompleted,
  avgScore,
  activeDays,
}: {
  activityMap: Record<string, number>;
  currentStreak: number;
  bestStreak: number;
  totalCompleted: number;
  avgScore: number;
  activeDays: number;
}) {
  const stats = [
    { icon: BookOpen, label: "Completados", value: totalCompleted.toString(), color: "#579F93" },
    { icon: Target, label: "Promedio", value: `${avgScore}%`, color: "#6366f1" },
    { icon: Calendar, label: "Días activos", value: activeDays.toString(), color: "#0ea5e9" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl p-4 flex flex-col gap-1"
          style={
            currentStreak > 0
              ? { background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)" }
              : { background: "hsl(var(--muted) / 0.4)" }
          }
        >
          <div className="flex items-center gap-1.5">
            <Flame
              className="h-4 w-4"
              style={{ color: currentStreak > 0 ? "rgba(255,255,255,0.9)" : "#f97316" }}
              strokeWidth={2}
            />
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{
                color:
                  currentStreak > 0 ? "rgba(255,255,255,0.75)" : "hsl(var(--muted-foreground))",
              }}
            >
              Racha actual
            </span>
          </div>
          <span
            className="text-4xl font-black tabular-nums leading-tight"
            style={{ color: currentStreak > 0 ? "#ffffff" : "hsl(var(--foreground))" }}
          >
            {currentStreak}
          </span>
          <span
            className="text-xs"
            style={{
              color:
                currentStreak > 0 ? "rgba(255,255,255,0.65)" : "hsl(var(--muted-foreground))",
            }}
          >
            día{currentStreak !== 1 ? "s" : ""} seguido{currentStreak !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="rounded-2xl bg-muted/40 dark:bg-stone-800/60 p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-500" strokeWidth={2} />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Mejor racha
            </span>
          </div>
          <span className="text-4xl font-black tabular-nums leading-tight text-foreground">
            {bestStreak}
          </span>
          <span className="text-xs text-muted-foreground">
            día{bestStreak !== 1 ? "s" : ""} máximo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl bg-muted/40 dark:bg-stone-800/60 p-3.5 flex flex-col gap-0.5"
          >
            <Icon className="h-3.5 w-3.5 mb-1" style={{ color }} strokeWidth={2} />
            <span className="text-2xl font-black tabular-nums leading-tight text-foreground">
              {value}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </span>
          </div>
        ))}
      </div>

      <ActivityHeatmap activityMap={activityMap} />
    </div>
  );
}

function TabLectura({
  weeklyProgress,
  peakWeek,
  expectedPpm,
}: {
  weeklyProgress: WeeklyProgressRow[];
  peakWeek: PeakWeek;
  expectedPpm: number;
}) {
  if (weeklyProgress.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <span className="text-4xl">📖</span>
        <p className="text-sm text-muted-foreground">
          Completá ejercicios de lectura para ver tu progreso
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {peakWeek && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-1">
              🏆 Mejor semana
            </p>
            <p className="text-3xl font-bold text-amber-700 dark:text-amber-300 tabular-nums">
              {peakWeek.avg_wpm} PPM
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              semana del{" "}
              {format(new Date(peakWeek.week_start), "dd MMM yyyy", { locale: es })}
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">
              {peakWeek.sessions_count} sesiones
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-sm p-5 space-y-1">
        <p className="text-sm font-medium text-zinc-500 mb-2">Velocidad lectora (PPM)</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={weeklyProgress}
            margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis
              dataKey="week_start"
              tickFormatter={(d) => format(new Date(d), "dd/MM", { locale: es })}
              tick={{ fontSize: 11 }}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v) =>
                v != null ? [`${v} PPM`, "Velocidad"] : ["Sin datos", ""]
              }
            />
            <ReferenceLine
              y={expectedPpm}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{
                value: "Meta grado",
                position: "insideTopRight",
                fill: "#f59e0b",
                fontSize: 11,
              }}
            />
            <Area
              type="monotone"
              dataKey="avg_wpm"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#wpmGradient)"
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-sm p-5 space-y-1">
        <p className="text-sm font-medium text-zinc-500 mb-2">
          Minutos de lectura activa por semana
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={weeklyProgress}
            margin={{ top: 4, right: 16, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis
              dataKey="week_start"
              tickFormatter={(d) => format(new Date(d), "dd/MM", { locale: es })}
              tick={{ fontSize: 11 }}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v} min`, "Lectura activa"]} />
            <Bar dataKey="reading_minutes" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TabPrecision({ accuracyByType }: { accuracyByType: AccuracyByTypeRow[] }) {
  if (accuracyByType.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <span className="text-4xl">🎯</span>
        <p className="text-sm text-muted-foreground">
          Completá ejercicios para ver tu precisión por tipo
        </p>
      </div>
    );
  }

  const chartHeight = Math.max(200, accuracyByType.length * 64);

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-sm p-5 space-y-1">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          layout="vertical"
          data={accuracyByType}
          margin={{ top: 4, right: 40, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <YAxis
            type="category"
            dataKey="display_name"
            width={170}
            tick={{ fontSize: 13 }}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => v + "%"}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(v, _, props) => [
              `${v}% · ${props.payload.total_sessions} sesiones`,
              "Precisión",
            ]}
          />
          <Bar dataKey="avg_accuracy" radius={[0, 4, 4, 0]} maxBarSize={36}>
            {accuracyByType.map((entry) => (
              <Cell
                key={entry.exercise_type}
                fill={TYPE_COLORS[entry.exercise_type] ?? "#94a3b8"}
              />
            ))}
            <LabelList
              dataKey="avg_accuracy"
              position="right"
              formatter={(v: number) => `${Math.round(v)}%`}
              style={{ fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
