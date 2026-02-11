import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExercisePath } from "./exercise-path";

export default async function TodosEjerciciosPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag: activeTag } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("exercises")
    .select("id, title, instructions, difficulty_level, exercise_type_id, tags, exercise_types(display_name)")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (activeTag) {
    query = query.contains("tags", [activeTag]);
  }

  const [{ data: exercises }, { data: allExercises }] = await Promise.all([
    query,
    supabase
      .from("exercises")
      .select("tags")
      .eq("is_active", true)
      .is("deleted_at", null),
  ]);

  const allTags = Array.from(
    new Set((allExercises ?? []).flatMap((e) => e.tags ?? []))
  ).sort();

  const mapped = (exercises ?? []).map((exercise) => ({
    id: exercise.id,
    title: exercise.title,
    instructions: exercise.instructions,
    difficulty_level: exercise.difficulty_level,
    tags: exercise.tags ?? [],
    typeName:
      exercise.exercise_types && !Array.isArray(exercise.exercise_types)
        ? exercise.exercise_types.display_name
        : null,
  }));

  return (
    <div>
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <Link href="/ejercicios/todos" className="inline-block">
            <Badge
              variant={!activeTag ? "default" : "outline"}
              className="cursor-pointer"
            >
              Todos
            </Badge>
          </Link>
          {allTags.map((tag) => (
            <Link
              key={tag}
              href={
                activeTag === tag
                  ? "/ejercicios/todos"
                  : `/ejercicios/todos?tag=${encodeURIComponent(tag)}`
              }
            >
              <Badge
                variant={activeTag === tag ? "default" : "outline"}
                className="cursor-pointer"
              >
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {mapped.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">
              {activeTag
                ? "No hay ejercicios con esta etiqueta."
                : "No hay ejercicios disponibles todavía."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ExercisePath exercises={mapped} />
      )}
    </div>
  );
}
