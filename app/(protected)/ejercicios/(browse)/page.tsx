import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, Play } from "lucide-react";

const difficultyLabels: Record<number, string> = {
  1: "Muy fácil",
  2: "Fácil",
  3: "Intermedio",
  4: "Difícil",
  5: "Muy difícil",
};

const difficultyColors: Record<number, string> = {
  1: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  2: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",
  3: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  4: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  5: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

function formatDueDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default async function EjerciciosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assignments } = await supabase
    .from("patient_assignments")
    .select(
      `
      id,
      exercise_id,
      status,
      due_date,
      notes_for_patient,
      assigned_by,
      exercises!inner (
        id,
        title,
        instructions,
        difficulty_level,
        exercise_types (
          display_name
        )
      )
    `
    )
    .eq("patient_id", user!.id)
    .in("status", ["assigned", "in_progress", "pending"])
    .neq("assigned_by", user!.id)
    .eq("exercises.is_active", true)
    .is("exercises.deleted_at", null)
    .order("due_date", { ascending: true, nullsFirst: false });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mis Ejercicios</CardTitle>
          <CardDescription>
            Estos son los ejercicios que tu profesional te preparó
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!assignments || assignments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-lg">
                Por ahora no tenés ejercicios nuevos.
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Cuando tu profesional te asigne actividades, van a aparecer acá.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assignments.map((assignment) => {
                const exercise = assignment.exercises as unknown as {
                  id: string;
                  title: string;
                  instructions: string;
                  difficulty_level: number;
                  exercise_types: { display_name: string } | null;
                };

                return (
                  <Card key={assignment.id} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-snug">
                          {exercise.title}
                        </CardTitle>
                        {assignment.status === "in_progress" && (
                          <Badge variant="secondary" className="shrink-0">
                            En curso
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {exercise.exercise_types && (
                          <Badge variant="outline">
                            {exercise.exercise_types.display_name}
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={
                            difficultyColors[exercise.difficulty_level] ?? ""
                          }
                        >
                          {difficultyLabels[exercise.difficulty_level] ??
                            `Nivel ${exercise.difficulty_level}`}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1 gap-3">
                      {assignment.due_date && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <CalendarClock className="h-4 w-4 shrink-0" />
                          <span>Vence el {formatDueDate(assignment.due_date)}</span>
                        </div>
                      )}
                      {assignment.notes_for_patient && (
                        <p className="text-sm text-muted-foreground italic">
                          &ldquo;{assignment.notes_for_patient}&rdquo;
                        </p>
                      )}
                      <div className="mt-auto pt-2">
                        <Button asChild className="w-full">
                          <Link href={`/ejercicios/${exercise.id}`}>
                            <Play className="h-4 w-4 mr-2" />
                            {assignment.status === "in_progress"
                              ? "Continuar"
                              : "Comenzar"}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
