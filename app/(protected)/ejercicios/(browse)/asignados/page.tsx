import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Play, CalendarClock, AlertCircle, BookOpen } from "lucide-react";
import { FloatingParticles } from "@/components/home/floating-particles";

const difficultyLabels: Record<number, string> = {
  1: "Muy fácil",
  2: "Fácil",
  3: "Intermedio",
  4: "Intermedio-Alto",
  5: "Difícil",
  6: "Muy difícil",
};

const difficultyAccent: Record<number, string> = {
  1: "#22c55e",
  2: "#84cc16",
  3: "#eab308",
  4: "#f97316",
  5: "#ef4444",
  6: "#dc2626",
};

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
      <FloatingParticles />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis ejercicios</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Actividades que tu profesional preparó para vos
        </p>
      </div>

      {!assignments || assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border border-dashed border-border bg-card/50">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <BookOpen className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Por ahora no tenés ejercicios</p>
            <p className="text-sm text-muted-foreground mt-1">
              Cuando tu profesional te asigne actividades, van a aparecer acá.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {assignments.map((assignment) => {
            const exercise = assignment.exercises as unknown as {
              id: string;
              title: string;
              instructions: string;
              difficulty_level: number;
              exercise_types: { display_name: string } | null;
            };

            const accent = difficultyAccent[exercise.difficulty_level] ?? "#94a3b8";
            const isInProgress = assignment.status === "in_progress";
            const due = assignment.due_date ? formatDueDate(assignment.due_date) : null;
            const isOverdue = due && due.diffDays < 0;
            const isUrgent = due && due.diffDays >= 0 && due.diffDays <= 2;

            return (
              <div
                key={assignment.id}
                className="relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-1.5 w-full" style={{ background: accent }} />

                <div className="flex flex-col flex-1 gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-bold text-base leading-snug text-foreground line-clamp-2">
                      {exercise.title}
                    </h2>
                    {isInProgress && (
                      <span
                        className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          background: `${accent}20`,
                          color: accent,
                          border: `1px solid ${accent}40`,
                        }}
                      >
                        En curso
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {exercise.exercise_types && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {exercise.exercise_types.display_name}
                      </span>
                    )}
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {difficultyLabels[exercise.difficulty_level] ?? `Nivel ${exercise.difficulty_level}`}
                    </span>
                    <div className="flex items-center gap-0.5 ml-auto">
                      {Array.from({ length: Math.min(exercise.difficulty_level, 6) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ background: accent }}
                        />
                      ))}
                    </div>
                  </div>

                  {due && (
                    <div
                      className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-2.5 py-1.5"
                      style={{
                        background: isOverdue
                          ? "rgba(239,68,68,0.1)"
                          : isUrgent
                          ? "rgba(249,115,22,0.1)"
                          : "rgba(0,0,0,0.04)",
                        color: isOverdue
                          ? "#ef4444"
                          : isUrgent
                          ? "#f97316"
                          : undefined,
                      }}
                    >
                      {isOverdue ? (
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <CalendarClock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" style={isUrgent ? { color: "#f97316" } : undefined} />
                      )}
                      <span className={!isOverdue && !isUrgent ? "text-muted-foreground" : ""}>
                        {isOverdue
                          ? `Venció el ${due.label}`
                          : isUrgent
                          ? `Vence ${due.diffDays === 0 ? "hoy" : "mañana"}`
                          : `Vence el ${due.label}`}
                      </span>
                    </div>
                  )}

                  {assignment.notes_for_patient && (
                    <p className="text-xs text-muted-foreground italic border-l-2 pl-2.5 line-clamp-2" style={{ borderColor: `${accent}60` }}>
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
