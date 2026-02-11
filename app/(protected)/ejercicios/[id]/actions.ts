"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { awardExerciseGems } from "@/lib/gems";

type CheckAnswerResult = {
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string | null;
};

export type AnswerResult = {
  questionId: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
};

export async function checkAnswer(
  exerciseId: string,
  questionId: string,
  selectedOptionId: string
): Promise<CheckAnswerResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autorizado");
  }

  const { data: exercise } = await supabase
    .from("exercises")
    .select("content")
    .eq("id", exerciseId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();

  if (!exercise) {
    throw new Error("Ejercicio no encontrado");
  }

  const content = exercise.content as Record<string, unknown>;
  const questions =
    (content.questions as Array<{
      id: string;
      correct_option_id: string;
      explanation?: string | null;
    }>) || [];

  const question = questions.find((q) => q.id === questionId);

  if (!question) {
    throw new Error("Pregunta no encontrada");
  }

  return {
    isCorrect: selectedOptionId === question.correct_option_id,
    correctOptionId: question.correct_option_id,
    explanation: question.explanation ?? null,
  };
}

export async function completeExercise(input: {
  exerciseId: string;
  answers: AnswerResult[];
  totalQuestions: number;
  correctAnswers: number;
  durationSeconds: number;
}): Promise<{ gemsAwarded: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const admin = createAdminClient();
  const patientId = user.id;

  const { data: assignment } = await admin
    .from("patient_assignments")
    .select("id")
    .eq("patient_id", patientId)
    .eq("exercise_id", input.exerciseId)
    .in("status", ["assigned", "in_progress"])
    .order("assigned_at", { ascending: false })
    .limit(1)
    .single();

  const isAssigned = !!assignment;
  let assignmentId: string;

  if (isAssigned) {
    assignmentId = assignment.id;
  } else {
    const { data: selfAssignment, error } = await admin
      .from("patient_assignments")
      .insert({
        patient_id: patientId,
        assigned_by: patientId,
        exercise_id: input.exerciseId,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error || !selfAssignment)
      throw new Error("Error al registrar ejercicio");
    assignmentId = selfAssignment.id;
  }

  const { count } = await admin
    .from("assignment_sessions")
    .select("id", { count: "exact", head: true })
    .eq("exercise_id", input.exerciseId)
    .eq("patient_id", patientId);

  const attemptNumber = (count ?? 0) + 1;

  const { data: session, error: sessionError } = await admin
    .from("assignment_sessions")
    .insert({
      assignment_id: assignmentId,
      exercise_id: input.exerciseId,
      patient_id: patientId,
      is_assigned: isAssigned,
      attempt_number: attemptNumber,
      ended_at: new Date().toISOString(),
      duration_seconds: Math.max(0, input.durationSeconds),
      is_completed: true,
    })
    .select("id")
    .single();

  if (sessionError || !session) throw new Error("Error al guardar sesión");

  if (input.answers.length > 0) {
    const { error: resultsError } = await admin
      .from("assignment_results")
      .insert(
        input.answers.map((a) => ({
          assignment_id: assignmentId,
          patient_id: patientId,
          session_id: session.id,
          question_id: a.questionId,
          patient_answer: { selected: a.selectedOptionId },
          correct_answer: { correct: a.correctOptionId },
          is_correct: a.isCorrect,
          time_spent_seconds: null,
          answered_at: new Date().toISOString(),
        }))
      );
    if (resultsError) throw new Error("Error al guardar resultados");
  }

  const scorePercentage =
    input.totalQuestions > 0
      ? Math.round((input.correctAnswers / input.totalQuestions) * 100)
      : 0;

  const { error: scoreError } = await admin
    .from("assignment_scores")
    .insert({
      assignment_id: assignmentId,
      session_id: session.id,
      patient_id: patientId,
      total_questions: input.totalQuestions,
      correct_answers: input.correctAnswers,
      incorrect_answers: input.totalQuestions - input.correctAnswers,
      score_percentage: scorePercentage,
      total_time_seconds: Math.max(0, input.durationSeconds),
    });

  if (scoreError) throw new Error("Error al guardar puntaje");

  if (isAssigned) {
    await admin
      .from("patient_assignments")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", assignmentId);
  }

  const gemResult = await awardExerciseGems(session.id, patientId);

  return { gemsAwarded: gemResult.totalAwarded };
}

export async function completeTimedReading(input: {
  exerciseId: string;
  timeSeconds: number;
  wordCount: number;
  wordsPerMinute: number;
}): Promise<{ gemsAwarded: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const admin = createAdminClient();
  const patientId = user.id;

  const { data: assignment } = await admin
    .from("patient_assignments")
    .select("id")
    .eq("patient_id", patientId)
    .eq("exercise_id", input.exerciseId)
    .in("status", ["assigned", "in_progress"])
    .order("assigned_at", { ascending: false })
    .limit(1)
    .single();

  const isAssigned = !!assignment;
  let assignmentId: string;

  if (isAssigned) {
    assignmentId = assignment.id;
  } else {
    const { data: selfAssignment, error } = await admin
      .from("patient_assignments")
      .insert({
        patient_id: patientId,
        assigned_by: patientId,
        exercise_id: input.exerciseId,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error || !selfAssignment)
      throw new Error("Error al registrar ejercicio");
    assignmentId = selfAssignment.id;
  }

  const { count } = await admin
    .from("assignment_sessions")
    .select("id", { count: "exact", head: true })
    .eq("exercise_id", input.exerciseId)
    .eq("patient_id", patientId);

  const attemptNumber = (count ?? 0) + 1;

  const { data: session, error: sessionError } = await admin
    .from("assignment_sessions")
    .insert({
      assignment_id: assignmentId,
      exercise_id: input.exerciseId,
      patient_id: patientId,
      is_assigned: isAssigned,
      attempt_number: attemptNumber,
      ended_at: new Date().toISOString(),
      duration_seconds: Math.max(0, input.timeSeconds),
      is_completed: true,
    })
    .select("id")
    .single();

  if (sessionError || !session) throw new Error("Error al guardar sesión");

  const { error: resultsError } = await admin
    .from("assignment_results")
    .insert({
      assignment_id: assignmentId,
      patient_id: patientId,
      session_id: session.id,
      question_id: "reading",
      patient_answer: {
        time_seconds: input.timeSeconds,
        words_per_minute: input.wordsPerMinute,
      },
      correct_answer: { word_count: input.wordCount },
      is_correct: true,
      time_spent_seconds: input.timeSeconds,
      answered_at: new Date().toISOString(),
    });

  if (resultsError) throw new Error("Error al guardar resultados");

  const { error: scoreError } = await admin
    .from("assignment_scores")
    .insert({
      assignment_id: assignmentId,
      session_id: session.id,
      patient_id: patientId,
      total_questions: 1,
      correct_answers: 1,
      incorrect_answers: 0,
      score_percentage: 100,
      total_time_seconds: Math.max(0, input.timeSeconds),
    });

  if (scoreError) throw new Error("Error al guardar puntaje");

  if (isAssigned) {
    await admin
      .from("patient_assignments")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", assignmentId);
  }

  const gemResult = await awardExerciseGems(session.id, patientId);

  return { gemsAwarded: gemResult.totalAwarded };
}
