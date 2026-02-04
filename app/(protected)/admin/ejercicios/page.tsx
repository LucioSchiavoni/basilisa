import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateExerciseForm } from "./create-exercise-form";
import { ExercisesList } from "./exercises-list";

export default async function AdminExercisesPage() {
  const supabase = await createClient();

  const { data: exercises } = await supabase
    .from("exercises")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gestión de Ejercicios</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Crear Ejercicio</CardTitle>
              <CardDescription>
                Añade un nuevo ejercicio al catálogo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateExerciseForm />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
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
      </div>
    </div>
  );
}
