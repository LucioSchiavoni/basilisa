import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { WorldExercisesList } from "./world-exercises-list";

export default async function WorldDetailPage({
  params,
}: {
  params: Promise<{ worldId: string }>;
}) {
  const { worldId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminClient = createAdminClient();

  const [{ data: world }, { data: worldExercisesData }] = await Promise.all([
    adminClient
      .from("worlds")
      .select("id, name, display_name, description, icon_url, difficulty_level")
      .eq("id", worldId)
      .eq("is_active", true)
      .single(),
    adminClient
      .from("world_exercises")
      .select("position, exercises(id, title, instructions, difficulty_level, is_active, deleted_at, exercise_types(name, display_name))")
      .eq("world_id", worldId)
      .order("position"),
  ]);

  if (!world) notFound();

  const worldExerciseIds = (worldExercisesData ?? [])
    .filter((we) => {
      const ex = we.exercises as { exercise_types: { name: string } | { name: string }[] | null } | null;
      if (!ex) return false;
      const t = ex.exercise_types && !Array.isArray(ex.exercise_types) ? ex.exercise_types.name : null;
      return t !== "math";
    })
    .map((we) => (we.exercises as { id: string } | null)?.id)
    .filter((id): id is string => id !== undefined);

  const { data: completedSessionsData } = worldExerciseIds.length > 0
    ? await supabase
        .from("assignment_sessions")
        .select("exercise_id")
        .eq("patient_id", user!.id)
        .eq("is_completed", true)
        .in("exercise_id", worldExerciseIds)
    : { data: [] };

  const exercises = (worldExercisesData ?? [])
    .filter((we) => {
      const ex = we.exercises as { is_active: boolean; deleted_at: string | null; exercise_types: { name: string } | { name: string }[] | null } | null;
      if (!ex || !ex.is_active || ex.deleted_at !== null) return false;
      const typeName = ex.exercise_types && !Array.isArray(ex.exercise_types) ? ex.exercise_types.name : null;
      return typeName !== "math";
    })
    .map((we, index) => {
      const ex = we.exercises as {
        id: string;
        title: string;
        instructions: string | null;
        difficulty_level: number;
        is_active: boolean;
        deleted_at: string | null;
        exercise_types: { name: string; display_name: string } | { name: string; display_name: string }[] | null;
      };
      const typeName =
        ex.exercise_types && !Array.isArray(ex.exercise_types)
          ? ex.exercise_types.display_name
          : null;
      return {
        id: ex.id,
        title: ex.title,
        instructions: ex.instructions,
        difficultyLevel: ex.difficulty_level,
        typeName,
        position: we.position ?? index + 1,
        isBonus: false,
      };
    });

  const completedIds = (completedSessionsData ?? []).map((s) => s.exercise_id).filter((id): id is string => id !== null);

  return (
    <WorldExercisesList
      exercises={exercises}
      completedExerciseIds={completedIds}
      worldName={world.name}
      displayName={world.display_name}
      worldId={worldId}
      difficultyLevel={(world as { difficulty_level: number }).difficulty_level}
    />
  );
}
