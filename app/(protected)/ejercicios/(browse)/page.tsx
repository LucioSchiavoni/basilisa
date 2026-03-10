import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Carousel from "@/components/mundos/carousel";
import { FloatingParticles } from "@/components/home/floating-particles";
import { WorldReturnAnimation } from "./world-return-animation";
import worldsLore from "@/json/historias-mundos.json";

const loreByLevel = Object.fromEntries(
  worldsLore.worlds.map((w) => [w.id, w.story])
);


export default async function EjerciciosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminClient = createAdminClient();

  const [worldsResult, progressResult] = await Promise.all([
    adminClient
      .from("worlds")
      .select("id, name, display_name, description, icon_url, difficulty_level, difficulty_label, therapeutic_description")
      .eq("is_active", true)
      .order("sort_order"),
    adminClient.rpc("get_world_progress", { p_patient_id: user!.id }),
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
      description: w.description ?? "",
      iconUrl: w.icon_url ?? "",
      difficultyLevel: w.difficulty_level ?? 1,
      difficultyLabel: w.difficulty_label ?? "",
      therapeuticDescription: w.therapeutic_description ?? "",
      lore: loreByLevel[w.difficulty_level ?? 1] ?? "",
      totalExercises: wp?.total ?? 0,
      completedExercises: wp?.completed ?? 0,
    };
  });

  return (
    <>
      <WorldReturnAnimation />
      <FloatingParticles />
      <div className="relative overflow-hidden w-full h-full pb-8 md:pb-10 flex flex-col items-center gap-2 md:gap-6">
        {worldsData.length > 0 ? (
          <Carousel
            slides={worldsData}
            title="Exploración de mundos"
            description="Cada mundo es una aventura distinta con ejercicios diseñados para ayudarte a leer y concentrarte mejor. Elegí el que más te guste y comenzá a explorar."
          />
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No hay mundos disponibles todavía.
          </p>
        )}
      </div>
    </>
  );
}
