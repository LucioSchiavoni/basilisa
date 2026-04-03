import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList, Plus } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { WorldExercisesSortableList } from "../../world-exercises-sortable-list";

export default async function AdminWorldExercisesPage({
  params,
}: {
  params: Promise<{ worldId: string }>;
}) {
  const { worldId } = await params;
  const adminClient = createAdminClient();

  const [{ data: world }, { data: worldExercises }] = await Promise.all([
    adminClient
      .from("worlds")
      .select("id, name, display_name, description, icon_url")
      .eq("id", worldId)
      .single(),
    adminClient
      .from("world_exercises")
      .select("id, position, is_bonus, exercises(id, title, instructions, difficulty_level, is_active, deleted_at, exercise_types(display_name))")
      .eq("world_id", worldId)
      .order("position"),
  ]);

  if (!world) {
    notFound();
  }

  const items = (worldExercises ?? []).map((item) => {
    const exercise = item.exercises && !Array.isArray(item.exercises)
      ? item.exercises
      : null;

    return {
      id: item.id,
      position: item.position,
      is_bonus: item.is_bonus,
      exercise: exercise ? {
        id: exercise.id,
        title: exercise.title,
        instructions: exercise.instructions,
        difficulty_level: exercise.difficulty_level,
        is_active: exercise.is_active,
        deleted_at: exercise.deleted_at,
        type_name:
          exercise.exercise_types && !Array.isArray(exercise.exercise_types)
            ? exercise.exercise_types.display_name
            : null,
      } : null,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="px-0">
            <Link href="/admin/ejercicios">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a mundos
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{world.display_name}</h1>
            <p className="text-sm text-muted-foreground">
              {world.description || "Gestioná el orden de aparición de los ejercicios de este mundo."}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/ejercicios/todos">
              <ClipboardList className="mr-2 h-4 w-4" />
              Ver todos
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/ejercicios/crear">
              <Plus className="mr-2 h-4 w-4" />
              Crear ejercicio
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="min-w-0 flex-1 rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total en el mundo</p>
          <p className="mt-1 text-2xl font-semibold">{items.length}</p>
        </div>
        <div className="min-w-0 flex-1 rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Activos</p>
          <p className="mt-1 text-2xl font-semibold">
            {items.filter((item) => item.exercise?.is_active && !item.exercise.deleted_at).length}
          </p>
        </div>
        <div className="min-w-0 flex-1 rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Ocultos o eliminados</p>
          <p className="mt-1 text-2xl font-semibold">
            {items.filter((item) => !item.exercise?.is_active || !!item.exercise?.deleted_at).length}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Este mundo todavía no tiene ejercicios relacionados.
          </p>
        </div>
      ) : (
        <WorldExercisesSortableList worldId={world.id} items={items} />
      )}
    </div>
  );
}
