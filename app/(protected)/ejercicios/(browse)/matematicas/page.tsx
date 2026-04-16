import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MatematicasExercisesList } from "./matematicas-exercises-list";

export default async function MatematicasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminClient = createAdminClient();

  const { data: exerciseType } = await adminClient
    .from("exercise_types")
    .select("id")
    .eq("name", "math")
    .single();

  if (!exerciseType) {
    return (
      <p className="text-muted-foreground text-center py-8">
        El tipo de ejercicio Matemáticas no está configurado aún.
      </p>
    );
  }

  const { data: exercisesData } = await adminClient
    .from("exercises")
    .select("id, title, instructions, difficulty_level")
    .eq("exercise_type_id", exerciseType.id)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const exercises = (exercisesData ?? []).map((e, index) => ({
    id: e.id,
    title: e.title,
    instructions: typeof e.instructions === "string" ? e.instructions : null,
    difficultyLevel: e.difficulty_level,
    position: index + 1,
  }));

  const exerciseIds = exercises.map((e) => e.id);

  const { data: completedSessionsData } = exerciseIds.length > 0
    ? await supabase
        .from("assignment_sessions")
        .select("exercise_id")
        .eq("patient_id", user!.id)
        .eq("is_completed", true)
        .in("exercise_id", exerciseIds)
    : { data: [] };

  const completedIds = (completedSessionsData ?? [])
    .map((s) => s.exercise_id)
    .filter((id): id is string => id !== null);

  return (
    <MatematicasExercisesList
      exercises={exercises}
      completedExerciseIds={completedIds}
    />
  );
}
