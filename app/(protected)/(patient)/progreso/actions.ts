"use server";

import { createClient } from "@/lib/supabase/server";

export type WeeklyProgressRow = {
  week_start: string;
  avg_wpm: number | null;
  max_wpm: number | null;
  avg_accuracy: number | null;
  reading_minutes: number;
  sessions_count: number;
  reading_sessions: number;
  wpm_by_type: Record<string, { avg: number; sessions: number; display_name: string }>;
  accuracy_by_type: Record<string, { avg: number; sessions: number; display_name: string }>;
};

export type PeakWeek = {
  week_start: string;
  avg_wpm: number;
  max_wpm: number;
  sessions_count: number;
} | null;

export async function getWeeklyProgress(): Promise<WeeklyProgressRow[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No autorizado");

    const sixteenWeeksAgo = new Date();
    sixteenWeeksAgo.setDate(sixteenWeeksAgo.getDate() - 16 * 7);
    const weekStartStr = sixteenWeeksAgo.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("patient_stats_weekly")
      .select(
        "week_start, avg_wpm, max_wpm, avg_accuracy, reading_minutes, sessions_count, reading_sessions, wpm_by_type, accuracy_by_type"
      )
      .eq("patient_id", user.id)
      .gte("week_start", weekStartStr)
      .order("week_start", { ascending: true });

    if (error) return [];
    return (data ?? []) as WeeklyProgressRow[];
  } catch {
    return [];
  }
}

export async function getPeakWeek(): Promise<PeakWeek> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No autorizado");

    const { data, error } = await supabase
      .from("patient_stats_weekly")
      .select("week_start, avg_wpm, max_wpm, sessions_count")
      .eq("patient_id", user.id)
      .not("avg_wpm", "is", null)
      .order("avg_wpm", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data as PeakWeek;
  } catch {
    return null;
  }
}

export async function getAccuracyByType(): Promise<
  { exercise_type: string; display_name: string; avg_accuracy: number; total_sessions: number }[]
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No autorizado");

    const { data, error } = await supabase
      .from("patient_stats_weekly")
      .select("accuracy_by_type")
      .eq("patient_id", user.id);

    if (error || !data) return [];

    const accumulated: Record<
      string,
      { display_name: string; weighted_sum: number; total_sessions: number }
    > = {};

    for (const row of data) {
      const byType = row.accuracy_by_type as WeeklyProgressRow["accuracy_by_type"] | null;
      if (!byType) continue;
      for (const [type, entry] of Object.entries(byType).filter(([t]) => t !== "timed_reading")) {
        if (!accumulated[type]) {
          accumulated[type] = {
            display_name: entry.display_name,
            weighted_sum: 0,
            total_sessions: 0,
          };
        }
        accumulated[type].weighted_sum += entry.avg * entry.sessions;
        accumulated[type].total_sessions += entry.sessions;
      }
    }

    return Object.entries(accumulated)
      .map(([exercise_type, { display_name, weighted_sum, total_sessions }]) => ({
        exercise_type,
        display_name,
        avg_accuracy: total_sessions > 0 ? weighted_sum / total_sessions : 0,
        total_sessions,
      }))
      .sort((a, b) => b.avg_accuracy - a.avg_accuracy);
  } catch {
    return [];
  }
}
