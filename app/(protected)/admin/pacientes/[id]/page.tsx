import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PatientStatsCards } from "./patient-stats-cards";
import { ExerciseHistory } from "./exercise-history";
import { AssignExerciseDialog } from "./assign-exercise-dialog";
import { AssignedExercises } from "./assigned-exercises";

type ExerciseContent = {
  questions: Array<{
    id: string;
    text: string;
    options: Array<{ id: string; text: string }>;
  }>;
};

function buildContentMap(
  exercises: Array<{ id: string; content: unknown }> | null
) {
  const map: Record<
    string,
    { questionText: string; options: Record<string, string> }
  > = {};

  if (!exercises) return map;

  for (const ex of exercises) {
    const content = ex.content as ExerciseContent;
    if (!content?.questions) continue;
    for (const q of content.questions) {
      const optionsMap: Record<string, string> = {};
      for (const opt of q.options || []) {
        optionsMap[opt.id] = opt.text;
      }
      map[q.id] = { questionText: q.text, options: optionsMap };
    }
  }

  return map;
}

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: profile },
    { data: gems },
    { data: sessions },
    { data: scores },
    { data: results },
    { data: assignments },
    { data: availableExercises },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, role, date_of_birth, created_at")
      .eq("id", id)
      .single(),
    supabase
      .from("user_gems")
      .select("total_gems, current_streak, best_streak")
      .eq("user_id", id)
      .single(),
    supabase
      .from("assignment_sessions")
      .select(
        "id, exercise_id, attempt_number, started_at, duration_seconds, is_assigned"
      )
      .eq("patient_id", id)
      .eq("is_completed", true)
      .order("started_at", { ascending: false }),
    supabase
      .from("assignment_scores")
      .select(
        "session_id, total_questions, correct_answers, incorrect_answers, score_percentage, total_time_seconds, completed_at"
      )
      .eq("patient_id", id)
      .order("completed_at", { ascending: false }),
    supabase
      .from("assignment_results")
      .select(
        "session_id, question_id, patient_answer, correct_answer, is_correct, time_spent_seconds"
      )
      .eq("patient_id", id),
    supabase
      .from("patient_assignments")
      .select("id, exercise_id, status, assigned_at, due_date, notes_for_patient, exercises(title)")
      .eq("patient_id", id)
      .neq("assigned_by", id)
      .in("status", ["assigned", "in_progress", "pending", "completed"])
      .order("assigned_at", { ascending: false }),
    supabase
      .from("exercises")
      .select("id, title, difficulty_level, exercise_types(display_name)")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("title"),
  ]);

  if (!profile) {
    notFound();
  }

  const exerciseIds = [
    ...new Set(sessions?.map((s) => s.exercise_id) ?? []),
  ];

  const sessionIds = sessions?.map((s) => s.id) ?? [];

  const [{ data: exercises }, { data: gemTransactions }] = await Promise.all([
    exerciseIds.length > 0
      ? supabase
          .from("exercises")
          .select("id, title, content")
          .in("id", exerciseIds)
      : Promise.resolve({ data: [] as { id: string; title: string; content: unknown }[] }),
    sessionIds.length > 0
      ? supabase
          .from("gem_transactions")
          .select("session_id, amount")
          .eq("user_id", id)
          .in("session_id", sessionIds)
      : Promise.resolve({ data: [] as { session_id: string | null; amount: number }[] }),
  ]);

  const exerciseTitleMap = new Map<string, string>();
  exercises?.forEach((e) => exerciseTitleMap.set(e.id, e.title));

  const contentMap = buildContentMap(exercises ?? null);

  const gemsBySession = new Map<string, number>();
  gemTransactions?.forEach((t) => {
    if (t.session_id) {
      gemsBySession.set(
        t.session_id,
        (gemsBySession.get(t.session_id) || 0) + t.amount
      );
    }
  });

  const scoreBySession = new Map(
    scores?.map((s) => [s.session_id, s]) ?? []
  );

  const resultsBySession = new Map<string, typeof results>();
  results?.forEach((r) => {
    const arr = resultsBySession.get(r.session_id) || [];
    arr.push(r);
    resultsBySession.set(r.session_id, arr);
  });

  const allScores = scores?.map((s) => s.score_percentage) ?? [];
  const averageScore =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

  const attempts = (sessions ?? []).map((s) => {
    const score = scoreBySession.get(s.id);
    const sessionResults = resultsBySession.get(s.id) ?? [];

    return {
      sessionId: s.id,
      exerciseTitle: exerciseTitleMap.get(s.exercise_id) || "Ejercicio",
      completedAt: s.started_at,
      scorePercentage: score?.score_percentage ?? 0,
      correctAnswers: score?.correct_answers ?? 0,
      totalQuestions: score?.total_questions ?? 0,
      durationSeconds: s.duration_seconds ?? 0,
      gemsEarned: gemsBySession.get(s.id) || 0,
      isAssigned: s.is_assigned ?? false,
      results: sessionResults.map((r) => {
        const questionInfo = contentMap[r.question_id];
        const patientOptionId = (r.patient_answer as { selected?: string })
          ?.selected;
        const correctOptionId = (r.correct_answer as { correct?: string })
          ?.correct;

        return {
          questionId: r.question_id,
          questionText: questionInfo?.questionText || "Pregunta",
          patientAnswerText: patientOptionId
            ? questionInfo?.options[patientOptionId] || patientOptionId
            : "Sin respuesta",
          correctAnswerText: correctOptionId
            ? questionInfo?.options[correctOptionId] || correctOptionId
            : "—",
          isCorrect: r.is_correct,
          timeSpentSeconds: r.time_spent_seconds,
        };
      }),
    };
  });

  const exercisesForDialog = (availableExercises ?? []).map((e) => {
    const exerciseType = e.exercise_types as { display_name: string } | null;
    return {
      id: e.id,
      title: e.title,
      exerciseTypeDisplayName: exerciseType?.display_name ?? "Sin tipo",
      difficultyLevel: e.difficulty_level,
    };
  });

  const assignmentsList = (assignments ?? []).map((a) => {
    const exercise = a.exercises as { title: string } | null;
    return {
      id: a.id,
      exerciseTitle: exercise?.title ?? "Ejercicio",
      status: a.status ?? "assigned",
      assignedAt: a.assigned_at,
      dueDate: a.due_date,
      notesForPatient: a.notes_for_patient,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pacientes"
            className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {profile.full_name || "Paciente"}
          </h1>
        </div>
        <AssignExerciseDialog
          patientId={id}
          exercises={exercisesForDialog}
        />
      </div>

      <PatientStatsCards
        exercisesCompleted={sessions?.length ?? 0}
        averageScore={averageScore}
        currentStreak={gems?.current_streak ?? 0}
        totalGems={gems?.total_gems ?? 0}
      />

      <AssignedExercises assignments={assignmentsList} patientId={id} />

      <ExerciseHistory attempts={attempts} />
    </div>
  );
}
