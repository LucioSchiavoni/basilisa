import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { ExercisePlayer } from "./exercise-player";

function stripAnswers(content: Record<string, unknown>): Record<string, unknown> {
  const questions =
    (content.questions as Array<Record<string, unknown>>) || [];

  return {
    ...content,
    questions: questions.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ correct_option_id, explanation, ...rest }) => rest
    ),
  };
}

export default async function ExercisePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userGemsData } = await admin
    .from("user_gems")
    .select("total_gems")
    .eq("user_id", user!.id)
    .maybeSingle();

  const initialGems = userGemsData?.total_gems ?? 0;

  const { data: exercise } = await supabase
    .from("exercises")
    .select(
      "id, title, instructions, instructions_audio_url, difficulty_level, content, world_id, exercise_types(name, display_name)"
    )
    .eq("id", id)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();

  if (!exercise) {
    notFound();
  }

  let worldId: string | undefined;
  let worldName: string | undefined;

  if (exercise.world_id) {
    const { data: worldData } = await supabase
      .from("worlds")
      .select("id, name")
      .eq("name", exercise.world_id)
      .single();
    if (worldData) {
      worldId = worldData.id;
      worldName = worldData.name;
    }
  }

  const backHref =
    from === "asignados"
      ? "/ejercicios/asignados"
      : worldId
      ? `/ejercicios/mundos/${worldId}`
      : "/ejercicios";

  const typeName =
    exercise.exercise_types && !Array.isArray(exercise.exercise_types)
      ? exercise.exercise_types.name
      : "multiple_choice";

  const typeDisplayName =
    exercise.exercise_types && !Array.isArray(exercise.exercise_types)
      ? exercise.exercise_types.display_name
      : "";

  return (
    <ExercisePlayer
      initialGems={initialGems}
      exercise={{
        id: exercise.id,
        title: exercise.title,
        instructions: exercise.instructions ?? "",
        instructionsAudioUrl: exercise.instructions_audio_url,
        difficultyLevel: exercise.difficulty_level,
        content: stripAnswers(exercise.content as Record<string, unknown>),
        typeName,
        typeDisplayName,
        worldId: exercise.world_id ?? null,
      }}
      worldId={worldId}
      worldName={worldName}
      backHref={backHref}
    />
  );
}
