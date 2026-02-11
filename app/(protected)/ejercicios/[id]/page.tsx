import { createClient } from "@/lib/supabase/server";
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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: exercise } = await supabase
    .from("exercises")
    .select(
      "id, title, instructions, instructions_audio_url, difficulty_level, content, exercise_types(name, display_name)"
    )
    .eq("id", id)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();

  if (!exercise) {
    notFound();
  }

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
      exercise={{
        id: exercise.id,
        title: exercise.title,
        instructions: exercise.instructions,
        instructionsAudioUrl: exercise.instructions_audio_url,
        difficultyLevel: exercise.difficulty_level,
        content: stripAnswers(exercise.content as Record<string, unknown>),
        typeName,
        typeDisplayName,
      }}
    />
  );
}
