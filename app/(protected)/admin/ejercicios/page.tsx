import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExercisesList } from "./exercises-list";
import { Plus } from "lucide-react";

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
    .select("id, title, instructions, difficulty_level, is_active, created_at, tags, deleted_at")
    .order("created_at", { ascending: false });

  if (showDeleted) {
    query = query.not("deleted_at", "is", null);
  } else {
    query = query.is("deleted_at", null);
  }

  const { data: exercises } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Gestion de Ejercicios</h1>
        <Button asChild>
          <Link href="/admin/ejercicios/crear">
            <Plus className="h-4 w-4 mr-2" />
            Crear Ejercicio
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{showDeleted ? "Ejercicios Eliminados" : "Lista de Ejercicios"}</CardTitle>
              <CardDescription>
                {exercises?.length || 0} ejercicios {showDeleted ? "eliminados" : "disponibles"}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={showDeleted ? "/admin/ejercicios" : "/admin/ejercicios?show=deleted"}>
                {showDeleted ? "Ver activos" : "Ver eliminados"}
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ExercisesList exercises={exercises || []} showDeleted={showDeleted} />
        </CardContent>
      </Card>
    </div>
  );
}
