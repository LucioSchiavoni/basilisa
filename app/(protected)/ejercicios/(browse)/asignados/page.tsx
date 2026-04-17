import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Play, CalendarClock, AlertCircle, BookOpen } from "lucide-react";

const difficultyLabels: Record<number, string> = {
  1: "Muy fácil",
  2: "Fácil",
  3: "Intermedio",
  4: "Intermedio-Alto",
  5: "Difícil",
  6: "Muy difícil",
};

const palette = ["#C73341", "#579F93", "#D3A021", "#2E85C8"];

function formatDueDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const label = date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return { label, diffDays };
}

export default async function AsignadosPage() {
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
    <div className="relative space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis ejercicios</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Actividades que tu profesional preparó para ti
        </p>
      </div>

      {!assignments || assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border border-dashed border-border bg-card/50">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <BookOpen className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Por ahora no tienes ejercicios</p>
            <p className="text-sm text-muted-foreground mt-1">
              Cuando tu profesional te asigne actividades, aparecerán aquí.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {assignments.map((assignment, index) => {
            const exercise = assignment.exercises as unknown as {
              id: string;
              title: string;
              instructions: string;
              difficulty_level: number;
              exercise_types: { display_name: string } | null;
            };

            const accent = palette[index % palette.length];
            const isInProgress = assignment.status === "in_progress";
            const due = assignment.due_date ? formatDueDate(assignment.due_date) : null;
            const isOverdue = due && due.diffDays < 0;
            const isUrgent = due && due.diffDays >= 0 && due.diffDays <= 2;

            return (
              <div
                key={assignment.id}
                className="relative flex flex-col rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                style={{ border: `1.5px solid ${accent}30` }}
              >
                <div
                  className="px-5 pt-4 pb-3"
                  style={{ background: accent }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="flex-1 font-bold text-base leading-snug text-white line-clamp-2">
                      {exercise.title}
                    </h2>
                    {isInProgress && (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                        En curso
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mt-2.5">
                    {exercise.exercise_types && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                        {exercise.exercise_types.display_name}
                      </span>
                    )}
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                      {difficultyLabels[exercise.difficulty_level] ?? `Nivel ${exercise.difficulty_level}`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col flex-1 gap-2.5 px-5 py-3 bg-card">
                  {due && (
                    <div
                      className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-2.5 py-1.5"
                      style={{
                        background: isOverdue
                          ? "rgba(239,68,68,0.08)"
                          : isUrgent
                          ? "rgba(249,115,22,0.08)"
                          : `${accent}0a`,
                        color: isOverdue ? "#ef4444" : isUrgent ? "#f97316" : accent,
                      }}
                    >
                      {isOverdue ? (
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span>
                        {isOverdue
                          ? `Venció el ${due.label}`
                          : isUrgent
                          ? `Vence ${due.diffDays === 0 ? "hoy" : due.diffDays === 1 ? "mañana" : "en 2 días"}`
                          : `Vence el ${due.label}`}
                      </span>
                    </div>
                  )}

                  {assignment.notes_for_patient && (
                    <p
                      className="text-xs text-muted-foreground italic border-l-2 pl-2.5 line-clamp-2"
                      style={{ borderColor: `${accent}70` }}
                    >
                      &ldquo;{assignment.notes_for_patient}&rdquo;
                    </p>
                  )}

                  <div className="mt-auto pt-1">
                    <Link
                      href={`/ejercicios/${exercise.id}?from=asignados`}
                      className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
                      style={{ background: accent }}
                    >
                      <Play className="h-4 w-4 fill-white" />
                      {isInProgress ? "Continuar" : "Comenzar"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
