import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { WorldPath } from "@/components/mundos/world-path";
import { PatientProfileCard } from "@/components/mundos/patient-profile-card";

export default async function EjerciciosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminClient = createAdminClient();

  const [worldsResult, progressResult, profileResult] = await Promise.all([
    adminClient
      .from("worlds")
      .select("id, name, display_name, difficulty_level")
      .eq("is_active", true)
      .order("sort_order"),
    adminClient.rpc("get_world_progress", { p_patient_id: user!.id }),
    supabase.from("profiles").select("full_name").eq("id", user!.id).single(),
  ]);

  const worlds = worldsResult.data ?? [];
  const progress = progressResult.data ?? [];

  const progressByWorld = new Map(
    progress.map((p: { world_name: string; total_exercises: number; completed_exercises: number }) => [
      p.world_name,
      { total: Number(p.total_exercises), completed: Number(p.completed_exercises) },
    ])
  );

  const worldsData = worlds.map((w) => {
    const wp = progressByWorld.get(w.name);
    return {
      id: w.id,
      name: w.name,
      displayName: w.display_name,
      difficultyLevel: w.difficulty_level ?? 1,
      totalExercises: wp?.total ?? 0,
      completedExercises: wp?.completed ?? 0,
    };
  });

  if (worldsData.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No hay mundos disponibles todavía.
      </p>
    );
  }

  const totalCompleted = worldsData.reduce((sum, w) => sum + w.completedExercises, 0);
  const totalExercises = worldsData.reduce((sum, w) => sum + w.totalExercises, 0);

  return (
    <div className="flex items-start gap-8">
      <div className="flex-1 min-w-0">
        <WorldPath worlds={worldsData} />
      </div>
      <aside className="hidden lg:block w-56 shrink-0" style={{ paddingTop: 180 }}>
        <PatientProfileCard
          fullName={profileResult.data?.full_name ?? null}
          email={user!.email!}
          totalCompleted={totalCompleted}
          totalExercises={totalExercises}
        />
      </aside>
    </div>
  );
}
