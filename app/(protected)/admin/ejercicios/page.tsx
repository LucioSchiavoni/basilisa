import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExercisesList } from "./exercises-list";
import { Plus } from "lucide-react";

export default async function AdminExercisesPage() {
  const supabase = await createClient();

  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, title, instructions, difficulty_level, estimated_time_seconds, is_active, created_at")
    .order("created_at", { ascending: false });

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
          <CardTitle>Lista de Ejercicios</CardTitle>
          <CardDescription>
            {exercises?.length || 0} ejercicios disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExercisesList exercises={exercises || []} />
        </CardContent>
      </Card>
    </div>
  );
}
