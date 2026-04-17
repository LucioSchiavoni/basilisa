import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { ExercisePlayer } from "./exercise-player";
import { analyzeText } from "@/lib/services/idl";
import type { Database } from "@/types/database.types";

function stripAnswers(content: Record<string, unknown>): Record<string, unknown> {
  const questions =
    (content.questions as Array<Record<string, unknown>>) || [];

  return {
    ...content,
    questions: questions.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ correct_option_id, explanation, correct_answer, ...rest }) => rest
    ),
  };
}

function buildAnswerKey(content: Record<string, unknown>): Record<string, string> {
  const questions =
    (content.questions as Array<Record<string, unknown>>) || [];
  return Object.fromEntries(
    questions.map((q) => [q.id as string, ((q.correct_option_id ?? q.correct_answer) as string) ?? ""])
  );
}

export default async function ExercisePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; worldId?: string }>;
}) {
  const { id } = await params;
  const { from, worldId: worldIdParam } = await searchParams;
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: userGemsData }, { data: exercise }, { data: profileData }] = await Promise.all([
    admin
      .from("user_gems")
      .select("total_gems")
      .eq("user_id", user!.id)
      .maybeSingle(),
    supabase
      .from("exercises")
      .select(
        "id, title, instructions, instructions_audio_url, difficulty_level, content, world_id, idl_score, exercise_types(name, display_name)"
      )
      .eq("id", id)
      .eq("is_active", true)
      .is("deleted_at", null)
      .single(),
    supabase
      .from("profiles")
      .select("grade_year")
      .eq("id", user!.id)
      .maybeSingle(),
  ]);

  // Si exercise es null, undefined o un error de Supabase, mostrar notFound
  type ExerciseRow = Database["public"]["Tables"]["exercises"]["Row"] & {
    idl_score?: number | null;
    exercise_types?: { name: string; display_name: string } | null;
  };
  const validExercise = exercise as ExerciseRow | null;
  if (!validExercise || typeof validExercise !== "object" || "code" in validExercise) {
    notFound();
  }

  const initialGems = userGemsData?.total_gems ?? 0;
  const gradeYear = (profileData as { grade_year?: number | null } | null)?.grade_year ?? null;

  const typeName =
    validExercise.exercise_types && !Array.isArray(validExercise.exercise_types)
      ? validExercise.exercise_types.name
      : "multiple_choice";

  let worldId: string | undefined;
  let worldName: string | undefined;

  if (typeName !== "math") {
    if (worldIdParam) {
      const { data: worldData } = await supabase
        .from("worlds")
        .select("id, name")
        .eq("id", worldIdParam)
        .single();
      if (worldData) {
        worldId = worldData.id;
        worldName = worldData.name;
      }
    } else if (validExercise.world_id) {
      const { data: worldData } = await supabase
        .from("worlds")
        .select("id, name")
        .eq("name", validExercise.world_id)
        .single();
      if (worldData) {
        worldId = worldData.id;
        worldName = worldData.name;
      }
    }
  }

  const typeDisplayName =
    validExercise.exercise_types && !Array.isArray(validExercise.exercise_types)
      ? validExercise.exercise_types.display_name
      : "";

  const backHref =
    from === "asignados"
      ? "/ejercicios/asignados"
      : typeName === "math"
      ? "/ejercicios/matematicas"
      : worldId
      ? `/ejercicios/mundos/${worldId}`
      : "/ejercicios";

  const rawContent = validExercise.content as Record<string, unknown>;

  const idlScore = validExercise.idl_score ?? null;

  if (idlScore === null && (typeName === "reading_comprehension" || typeName === "timed_reading")) {
    const readingText = typeof rawContent.reading_text === "string" && rawContent.reading_text.trim()
      ? rawContent.reading_text
      : null;
    if (readingText) {
      analyzeText(readingText)
        .then(async (result) => {
          if (result.score !== null) {
            await admin.from("exercises").update({ idl_score: result.score } as any).eq("id", validExercise.id);
          }
        })
        .catch(() => {});
    }
  }

  return (
    <ExercisePlayer
      initialGems={initialGems}
      gradeYear={gradeYear}
      answerKey={buildAnswerKey(rawContent)}
      exercise={{
        id: validExercise.id,
        title: validExercise.title,
        instructions: (() => {
          const raw = validExercise.instructions;
          if (typeof raw === "string") return raw;
          if (Array.isArray(raw)) {
            return (raw as { type: string; content: string }[])
              .map((i) => i.content)
              .filter(Boolean)
              .join("\n");
          }
          return "";
        })(),
        instructionsAudioUrl: validExercise.instructions_audio_url,
        difficultyLevel: validExercise.difficulty_level,
        content: stripAnswers(rawContent),
        typeName,
        typeDisplayName,
        worldId: validExercise.world_id ?? null,
        idlScore,
      }}
      worldId={worldId}
      worldName={worldName}
      backHref={backHref}
    />
  );
}
