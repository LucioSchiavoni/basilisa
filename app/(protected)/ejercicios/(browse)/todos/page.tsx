import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";

const difficultyLabels: Record<number, string> = {
  1: "Muy fácil",
  2: "Fácil",
  3: "Intermedio",
  4: "Difícil",
  5: "Muy difícil",
};

const difficultyColors: Record<number, string> = {
  1: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  2: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  3: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  4: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  5: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default async function TodosEjerciciosPage() {
  const supabase = await createClient();

  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, title, instructions, difficulty_level, estimated_time_seconds, exercise_type_id, exercise_types(display_name)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-6">
        {exercises?.length || 0} ejercicios disponibles
      </p>

      {!exercises || exercises.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">
              No hay ejercicios disponibles todavía.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {exercises.map((exercise) => {
            const typeName =
              exercise.exercise_types &&
              !Array.isArray(exercise.exercise_types)
                ? exercise.exercise_types.display_name
                : null;

            return (
              <Link key={exercise.id} href={`/ejercicios/${exercise.id}`}>
                <Card className="transition-colors hover:border-primary cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{exercise.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        {typeName && (
                          <Badge variant="outline">{typeName}</Badge>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            difficultyColors[exercise.difficulty_level] || difficultyColors[3]
                          }`}
                        >
                          {difficultyLabels[exercise.difficulty_level] || `Nivel ${exercise.difficulty_level}`}
                        </span>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {exercise.instructions}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(exercise.estimated_time_seconds)} estimados
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
