import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { ExercisesList } from "../exercises-list";
import { notFound } from "next/navigation";

export default async function AdminMathExercisesPage() {
  const adminClient = createAdminClient();

  const { data: mathType } = await adminClient
    .from("exercise_types")
    .select("id")
    .eq("name", "math")
    .maybeSingle();

  if (!mathType) notFound();

  const { data: exercises } = await adminClient
    .from("exercises")
    .select("id, title, instructions, difficulty_level, is_active, created_at, tags, deleted_at, world_id")
    .eq("exercise_type_id", mathType.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const { data: deletedExercises } = await adminClient
    .from("exercises")
    .select("id, title, instructions, difficulty_level, is_active, created_at, tags, deleted_at, world_id")
    .eq("exercise_type_id", mathType.id)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  const mapExercise = (e: {
    id: string;
    title: string;
    instructions: string | null;
    difficulty_level: number;
    is_active: boolean;
    created_at: string;
    tags: string[] | null;
    deleted_at: string | null;
    world_id: string | null;
  }) => ({
    id: e.id,
    title: e.title,
    instructions: typeof e.instructions === "string" ? e.instructions : null,
    difficulty_level: e.difficulty_level,
    is_active: e.is_active,
    created_at: e.created_at,
    tags: e.tags,
    deleted_at: e.deleted_at,
    world_name: null,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="px-0">
            <Link href="/admin/ejercicios">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a ejercicios
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Matemáticas</h1>
            <p className="text-sm text-muted-foreground">
              Ejercicios del área de matemáticas.
            </p>
          </div>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/ejercicios/crear">
            <Plus className="mr-2 h-4 w-4" />
            Crear ejercicio
          </Link>
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="min-w-0 flex-1 rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total activos</p>
          <p className="mt-1 text-2xl font-semibold">{exercises?.length ?? 0}</p>
        </div>
        <div className="min-w-0 flex-1 rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Eliminados</p>
          <p className="mt-1 text-2xl font-semibold">{deletedExercises?.length ?? 0}</p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Ejercicios activos</h2>
        <ExercisesList exercises={(exercises ?? []).map(mapExercise)} />
      </section>

      {(deletedExercises?.length ?? 0) > 0 && (
        <section className="space-y-4">
          <h2 className="text-base font-semibold">Eliminados</h2>
          <ExercisesList exercises={(deletedExercises ?? []).map(mapExercise)} showDeleted />
        </section>
      )}
    </div>
  );
}
