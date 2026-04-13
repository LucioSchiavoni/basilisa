import { createClient } from "@/lib/supabase/server";
import { getWeeklyProgress, getPeakWeek, getAccuracyByType } from "./actions";
import { ProgressDashboard } from "@/components/patient/progress/ProgressDashboard";

const PPM_BY_GRADE: Record<number, number> = {
  1: 53,
  2: 72,
  3: 89,
  4: 107,
  5: 124,
  6: 140,
};

export default async function ProgresoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const [weeklyProgress, peakWeek, accuracyByType, gemsResult, sessionsResult, scoresResult, profileResult] =
    await Promise.all([
      getWeeklyProgress(),
      getPeakWeek(),
      getAccuracyByType(),
      supabase
        .from("user_gems")
        .select("current_streak, best_streak")
        .eq("user_id", user!.id)
        .single(),
      supabase
        .from("assignment_sessions")
        .select("ended_at")
        .eq("patient_id", user!.id)
        .eq("is_completed", true)
        .not("ended_at", "is", null)
        .gte("ended_at", oneYearAgo.toISOString()),
      supabase
        .from("assignment_scores")
        .select("score_percentage")
        .eq("patient_id", user!.id),
      supabase
        .from("profiles")
        .select("grade_year")
        .eq("id", user!.id)
        .single(),
    ]);

  const gems = gemsResult.data;
  const sessions = sessionsResult.data ?? [];
  const scores = scoresResult.data ?? [];
  const grade = profileResult.data?.grade_year ?? 1;

  const activityMap: Record<string, number> = {};
  for (const s of sessions) {
    if (!s.ended_at) continue;
    const date = s.ended_at.slice(0, 10);
    activityMap[date] = (activityMap[date] ?? 0) + 1;
  }

  const totalCompleted = scores.length;
  const avgScore =
    scores.length > 0
      ? Math.round(
          scores.reduce((sum, s) => sum + Number(s.score_percentage), 0) / scores.length
        )
      : 0;
  const activeDays = Object.keys(activityMap).length;

  const expectedPpm = PPM_BY_GRADE[grade] ?? PPM_BY_GRADE[1];

  return (
    <div className="pb-10">
      <ProgressDashboard
        weeklyProgress={weeklyProgress}
        peakWeek={peakWeek}
        accuracyByType={accuracyByType}
        expectedPpm={expectedPpm}
        activityMap={activityMap}
        currentStreak={gems?.current_streak ?? 0}
        bestStreak={gems?.best_streak ?? 0}
        totalCompleted={totalCompleted}
        avgScore={avgScore}
        activeDays={activeDays}
      />
    </div>
  );
}
