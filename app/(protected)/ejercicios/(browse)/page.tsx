import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { WorldsGrid } from "./mundos/worlds-grid";

export default async function EjerciciosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminClient = createAdminClient();

  const [worldsResult, exercisesResult, completedSessionsResult] =
    await Promise.all([
      adminClient
        .from("worlds")
        .select("id, name, display_name, description, icon_url, difficulty_level, difficulty_label, therapeutic_description")
        .eq("is_active", true)
        .order("sort_order"),
      adminClient
        .from("exercises")
        .select("id, world_id")
        .eq("is_active", true)
        .is("deleted_at", null),
      adminClient
        .from("assignment_sessions")
        .select("exercise_id")
        .eq("patient_id", user!.id)
        .eq("is_completed", true),
    ]);

  const { data: worlds } = worldsResult;
  const { data: exercises } = exercisesResult;
  const { data: completedSessions } = completedSessionsResult;

  const exercisesByWorld: Record<string, number> = {};
  const exerciseIdToWorld: Record<string, string> = {};
  (exercises ?? []).forEach((e) => {
    if (e.world_id) {
      exercisesByWorld[e.world_id] = (exercisesByWorld[e.world_id] || 0) + 1;
      exerciseIdToWorld[e.id] = e.world_id;
    }
  });

  const completedByWorld: Record<string, Set<string>> = {};
  (completedSessions ?? []).forEach((s) => {
    if (!s.exercise_id) return;
    const worldName = exerciseIdToWorld[s.exercise_id];
    if (worldName) {
      if (!completedByWorld[worldName]) completedByWorld[worldName] = new Set();
      completedByWorld[worldName].add(s.exercise_id);
    }
  });

  const sortedWorlds = worlds ?? [];
  const worldsData = sortedWorlds.map((w) => ({
    id: w.id,
    name: w.name,
    displayName: w.display_name,
    description: w.description,
    iconUrl: w.icon_url,
    difficultyLevel: w.difficulty_level,
    difficultyLabel: w.difficulty_label,
    therapeuticDescription: w.therapeutic_description,
    totalExercises: exercisesByWorld[w.name] || 0,
    completedExercises: completedByWorld[w.name]?.size || 0,
  }));

  return <WorldsGrid worlds={worldsData} />;
}
