import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorldExercisesList } from "./world-exercises-list";
import { WorldBackButton } from "./world-back-button";

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

  const [{ data: world }, { data: worldExercisesData }] = await Promise.all([
    supabase
      .from("worlds")
      .select("id, name, display_name, description, icon_url")
      .eq("id", worldId)
      .eq("is_active", true)
      .single(),
    supabase
      .from("world_exercises")
      .select("position, exercises(id, title, instructions, difficulty_level, exercise_types(display_name))")
      .eq("world_id", worldId)
      .order("position"),
  ]);

  if (!world) notFound();

  const worldExerciseIds = (worldExercisesData ?? [])
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
    .filter((we) => we.exercises !== null)
    .map((we, index) => {
      const ex = we.exercises as {
        id: string;
        title: string;
        instructions: string | null;
        difficulty_level: number;
        exercise_types: { display_name: string } | { display_name: string }[] | null;
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
    <>
      <WorldBackButton worldName={world.name} displayName={world.display_name} />

      <WorldExercisesList
        exercises={exercises}
        completedExerciseIds={completedIds}
        worldName={world.name}
        displayName={world.display_name}
      />
    </>
  );
}
