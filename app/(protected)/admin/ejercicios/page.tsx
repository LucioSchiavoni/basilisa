import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ExercisesList } from "./exercises-list";
import { Plus } from "lucide-react";
import { WORLDS } from "@/lib/worlds";

export default async function AdminExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const { show } = await searchParams;
  const showDeleted = show === "deleted";
  const supabase = await createClient();

  let query = supabase
    .from("exercises")
    .select("id, title, instructions, difficulty_level, is_active, created_at, tags, deleted_at, world_id")
    .order("created_at", { ascending: false });

  if (showDeleted) {
    query = query.not("deleted_at", "is", null);
  } else {
    query = query.is("deleted_at", null);
  }

  const { data: exercises } = await query;

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold sm:text-3xl">Gestión de Ejercicios</h1>

      <section className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">{showDeleted ? "Ejercicios Eliminados" : "Ejercicios"}</h2>
            <p className="text-sm text-muted-foreground">{exercises?.length || 0} {showDeleted ? "eliminados" : "disponibles"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={showDeleted ? "/admin/ejercicios" : "/admin/ejercicios?show=deleted"}>
                {showDeleted ? "Ver activos" : "Ver eliminados"}
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/ejercicios/crear">
                <Plus className="h-4 w-4 mr-2" />
                Crear Ejercicio
              </Link>
            </Button>
          </div>
        </div>
        <ExercisesList
          exercises={(exercises || []).map((e) => ({
            ...e,
            world_name: e.world_id ? (WORLDS[e.world_id]?.displayName ?? null) : null,
          }))}
          showDeleted={showDeleted}
        />
      </section>
    </div>
  );
}
