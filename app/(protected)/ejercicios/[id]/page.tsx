import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ExercisePlayer } from "./exercise-player";

type ExerciseData = {
  id: string;
  title: string;
  instructions: string;
  instructions_audio_url: string | null;
  difficulty_level: number;
  estimated_time_minutes: number;
  content: Record<string, unknown>;
  exercise_types: {
    name: string;
    display_name: string;
  } | null;
};

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
      "id, title, instructions, instructions_audio_url, difficulty_level, estimated_time_minutes, content, exercise_types(name, display_name)"
    )
    .eq("id", id)
    .eq("is_active", true)
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
        estimatedTimeMinutes: exercise.estimated_time_minutes,
        content: exercise.content as Record<string, unknown>,
        typeName,
        typeDisplayName,
      }}
    />
  );
}
