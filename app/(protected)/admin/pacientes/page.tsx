import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientsList } from "./patients-list";

export type PatientSummary = {
  id: string;
  full_name: string | null;
  exercises_completed: number;
  average_score: number;
  total_gems: number;
  current_streak: number;
};

export default async function PacientesPage() {
  const supabase = await createClient();

  const { data: patients } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "patient")
    .order("full_name");

  if (!patients || patients.length === 0) {
    return (
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Seguimiento de Pacientes</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No hay pacientes registrados</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const patientIds = patients.map((p) => p.id);

  const [
    { data: sessions },
    { data: scores },
    { data: gemsData },
  ] = await Promise.all([
    supabase
      .from("assignment_sessions")
      .select("patient_id")
      .eq("is_completed", true)
      .in("patient_id", patientIds),
    supabase
      .from("assignment_scores")
      .select("patient_id, score_percentage")
      .in("patient_id", patientIds),
    supabase
      .from("user_gems")
      .select("user_id, total_gems, current_streak")
      .in("user_id", patientIds),
  ]);

  const sessionCountMap = new Map<string, number>();
  sessions?.forEach((s) => {
    sessionCountMap.set(s.patient_id, (sessionCountMap.get(s.patient_id) || 0) + 1);
  });

  const scoreMap = new Map<string, number[]>();
  scores?.forEach((s) => {
    const arr = scoreMap.get(s.patient_id) || [];
    arr.push(s.score_percentage);
    scoreMap.set(s.patient_id, arr);
  });

  const gemsMap = new Map<string, { total_gems: number; current_streak: number }>();
  gemsData?.forEach((g) => {
    gemsMap.set(g.user_id, { total_gems: g.total_gems, current_streak: g.current_streak });
  });

  const enrichedPatients: PatientSummary[] = patients.map((p) => {
    const patientScores = scoreMap.get(p.id) || [];
    const avgScore =
      patientScores.length > 0
        ? Math.round(patientScores.reduce((a, b) => a + b, 0) / patientScores.length)
        : 0;
    const gems = gemsMap.get(p.id);

    return {
      id: p.id,
      full_name: p.full_name,
      exercises_completed: sessionCountMap.get(p.id) || 0,
      average_score: avgScore,
      total_gems: gems?.total_gems || 0,
      current_streak: gems?.current_streak || 0,
    };
  });

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Seguimiento de Pacientes</h1>
      <Card>
        <CardHeader>
          <CardTitle>{enrichedPatients.length} Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <PatientsList patients={enrichedPatients} />
        </CardContent>
      </Card>
    </div>
  );
}
