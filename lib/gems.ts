import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database.types";

const GEMS = {
  ASSIGNED_EXERCISE_COMPLETE: 10,
  FREE_EXERCISE_COMPLETE: 5,
  ASSIGNED_PERFECT_SCORE: 5,
  FREE_PERFECT_SCORE: 3,
  FIRST_ATTEMPT: 3,
  STREAK_3: 15,
  STREAK_7: 50,
  STREAK_14: 100,
  STREAK_30: 300,
} as const;

const STREAK_MILESTONES = [
  { days: 30, amount: GEMS.STREAK_30, source: "streak_30" as const },
  { days: 14, amount: GEMS.STREAK_14, source: "streak_14" as const },
  { days: 7, amount: GEMS.STREAK_7, source: "streak_7" as const },
  { days: 3, amount: GEMS.STREAK_3, source: "streak_3" as const },
];

type GemSource =
  | "exercise_completion"
  | "perfect_score"
  | "free_exercise_completion"
  | "free_perfect_score"
  | "first_attempt"
  | "streak_3"
  | "streak_7"
  | "streak_14"
  | "streak_30";

type GemTransactionType = "earned" | "bonus";

async function createTransaction(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  amount: number,
  transactionType: GemTransactionType,
  source: GemSource,
  sessionId?: string,
  metadata?: Json
) {
  const { error } = await supabase.from("gem_transactions").insert({
    user_id: userId,
    amount,
    transaction_type: transactionType,
    source,
    session_id: sessionId ?? null,
    metadata: metadata ?? null,
  });

  if (error) throw new Error(`Failed to create gem transaction: ${error.message}`);
}

async function addGems(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  amount: number
) {
  const { data: current, error: readError } = await supabase
    .from("user_gems")
    .select("total_gems")
    .eq("user_id", userId)
    .single();

  if (readError || !current)
    throw new Error(`Failed to read user gems: ${readError?.message}`);

  const { error: updateError } = await supabase
    .from("user_gems")
    .update({
      total_gems: current.total_gems + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (updateError)
    throw new Error(`Failed to update gems: ${updateError.message}`);
}

export async function awardExerciseGems(sessionId: string, patientId: string) {
  const supabase = createAdminClient();

  const { data: existingTx } = await supabase
    .from("gem_transactions")
    .select("id")
    .eq("session_id", sessionId)
    .in("source", ["exercise_completion", "free_exercise_completion"])
    .single();

  if (existingTx) return { alreadyAwarded: true, totalAwarded: 0 };

  const { data: session, error: sessionError } = await supabase
    .from("assignment_sessions")
    .select("id, attempt_number, is_completed, is_assigned")
    .eq("id", sessionId)
    .eq("patient_id", patientId)
    .single();

  if (sessionError || !session)
    throw new Error(`Session not found: ${sessionError?.message}`);

  if (!session.is_completed)
    throw new Error("Session is not completed");

  const { data: score, error: scoreError } = await supabase
    .from("assignment_scores")
    .select("score_percentage")
    .eq("session_id", sessionId)
    .eq("patient_id", patientId)
    .single();

  if (scoreError || !score)
    throw new Error(`Score not found: ${scoreError?.message}`);

  const isAssigned = session.is_assigned;
  let totalAwarded = 0;

  const completionAmount = isAssigned
    ? GEMS.ASSIGNED_EXERCISE_COMPLETE
    : GEMS.FREE_EXERCISE_COMPLETE;
  const completionSource: GemSource = isAssigned
    ? "exercise_completion"
    : "free_exercise_completion";

  await createTransaction(
    supabase,
    patientId,
    completionAmount,
    "earned",
    completionSource,
    sessionId
  );
  totalAwarded += completionAmount;

  if (Number(score.score_percentage) === 100) {
    const perfectAmount = isAssigned
      ? GEMS.ASSIGNED_PERFECT_SCORE
      : GEMS.FREE_PERFECT_SCORE;
    const perfectSource: GemSource = isAssigned
      ? "perfect_score"
      : "free_perfect_score";

    await createTransaction(
      supabase,
      patientId,
      perfectAmount,
      "bonus",
      perfectSource,
      sessionId
    );
    totalAwarded += perfectAmount;
  }

  if (isAssigned && session.attempt_number === 1) {
    await createTransaction(
      supabase,
      patientId,
      GEMS.FIRST_ATTEMPT,
      "bonus",
      "first_attempt",
      sessionId
    );
    totalAwarded += GEMS.FIRST_ATTEMPT;
  }

  await addGems(supabase, patientId, totalAwarded);

  const streakGems = await updateStreak(patientId);
  totalAwarded += streakGems;

  return { alreadyAwarded: false, totalAwarded };
}

export async function updateStreak(patientId: string): Promise<number> {
  const supabase = createAdminClient();

  const { data: userGems, error } = await supabase
    .from("user_gems")
    .select("current_streak, best_streak, last_activity_date")
    .eq("user_id", patientId)
    .single();

  if (error || !userGems)
    throw new Error(`User gems not found: ${error?.message}`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  if (userGems.last_activity_date === todayStr) {
    return 0;
  }

  let newStreak: number;

  if (userGems.last_activity_date) {
    const lastActivity = new Date(userGems.last_activity_date);
    lastActivity.setHours(0, 0, 0, 0);
    const diffMs = today.getTime() - lastActivity.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    newStreak = diffDays === 1 ? userGems.current_streak + 1 : 1;
  } else {
    newStreak = 1;
  }

  const newBest = Math.max(newStreak, userGems.best_streak);

  const { error: updateError } = await supabase
    .from("user_gems")
    .update({
      current_streak: newStreak,
      best_streak: newBest,
      last_activity_date: todayStr,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", patientId);

  if (updateError)
    throw new Error(`Failed to update streak: ${updateError.message}`);

  let streakGems = 0;

  for (const milestone of STREAK_MILESTONES) {
    if (newStreak >= milestone.days) {
      const previousStreak = userGems.current_streak;
      const alreadyHitMilestone = previousStreak >= milestone.days;

      if (!alreadyHitMilestone) {
        const { data: existingBonus } = await supabase
          .from("gem_transactions")
          .select("id")
          .eq("user_id", patientId)
          .eq("source", milestone.source)
          .gte("created_at", getStreakWindowStart(todayStr, newStreak))
          .single();

        if (!existingBonus) {
          await createTransaction(
            supabase,
            patientId,
            milestone.amount,
            "bonus",
            milestone.source,
            undefined,
            { streak: newStreak }
          );
          streakGems += milestone.amount;
        }
      }
    }
  }

  if (streakGems > 0) {
    await addGems(supabase, patientId, streakGems);
  }

  return streakGems;
}

function getStreakWindowStart(todayStr: string, currentStreak: number): string {
  const date = new Date(todayStr);
  date.setDate(date.getDate() - currentStreak);
  return date.toISOString();
}

export async function getPlayerStats(patientId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("user_gems")
    .select("total_gems, current_streak, best_streak")
    .eq("user_id", patientId)
    .single();

  if (error || !data)
    throw new Error(`Player stats not found: ${error?.message}`);

  return {
    totalGems: data.total_gems,
    currentStreak: data.current_streak,
    bestStreak: data.best_streak,
  };
}
