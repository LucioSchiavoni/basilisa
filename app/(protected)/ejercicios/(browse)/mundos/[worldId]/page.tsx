import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
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

  const { data: world } = await supabase
    .from("worlds")
    .select("id, name, display_name, description, icon_url, character_image_url")
    .eq("id", worldId)
    .eq("is_active", true)
    .single();

  if (!world) notFound();

  const [{ data: exercisesData }, { data: progress }] = await Promise.all([
    supabase
      .from("exercises")
      .select("id, title, instructions, difficulty_level, exercise_types(display_name)")
      .eq("world_id", world.name)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("created_at"),
    supabase
      .from("player_world_progress")
      .select("last_completed_position, total_exercises_completed")
      .eq("player_id", user!.id)
      .eq("world_id", worldId)
      .maybeSingle(),
  ]);

  const lastCompletedPosition = progress?.last_completed_position ?? 0;

  const exercises = (exercisesData ?? []).map((ex, index) => {
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
      position: index + 1,
      isBonus: false,
    };
  });

  return (
    <>
      <Link
        href="/ejercicios"
        className="relative z-50 inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <WorldExercisesList
        exercises={exercises}
        lastCompletedPosition={lastCompletedPosition}
        worldName={world.name}
      />
    </>
  );
}
