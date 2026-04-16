import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ExercisesList } from "../exercises-list";
import { Plus, ChevronLeft, ChevronRight, FolderKanban } from "lucide-react";
import { WORLDS } from "@/lib/worlds";

const PAGE_SIZE = 50;

export default async function AdminAllExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string; page?: string }>;
}) {
  const { show, page: pageParam } = await searchParams;
  const showDeleted = show === "deleted";
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const supabase = await createClient();

  let query = supabase
    .from("exercises")
    .select("id, title, instructions, difficulty_level, is_active, created_at, tags, deleted_at, world_id", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (showDeleted) {
    query = query.not("deleted_at", "is", null);
  } else {
    query = query.is("deleted_at", null);
  }

  const { data: exercises, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const baseHref = showDeleted ? "/admin/ejercicios/todos?show=deleted" : "/admin/ejercicios/todos";

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Todos los ejercicios</h1>
          <p className="text-sm text-muted-foreground">
            Vista general para buscar, editar, eliminar y restaurar ejercicios.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/ejercicios">
              <FolderKanban className="h-4 w-4 mr-2" />
              Ver mundos
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

      <section className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">{showDeleted ? "Ejercicios Eliminados" : "Ejercicios"}</h2>
            <p className="text-sm text-muted-foreground">{count ?? 0} {showDeleted ? "eliminados" : "disponibles"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={showDeleted ? "/admin/ejercicios/todos" : "/admin/ejercicios/todos?show=deleted"}>
                {showDeleted ? "Ver activos" : "Ver eliminados"}
              </Link>
            </Button>
          </div>
        </div>
        <ExercisesList
          exercises={(exercises || []).map((e) => ({
            ...e,
            instructions: typeof e.instructions === "string" ? e.instructions : null,
            world_name: e.world_id ? (WORLDS[e.world_id]?.displayName ?? null) : null,
          }))}
          showDeleted={showDeleted}
        />
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            {page > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={page > 2 ? `${baseHref}&page=${page - 1}` : baseHref}>
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
            {page < totalPages ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`${baseHref}&page=${page + 1}`}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
