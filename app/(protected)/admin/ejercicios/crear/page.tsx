import { createClient } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CreateExerciseForm } from "./create-exercise-form"

export default async function CreateExercisePage() {
  const supabase = await createClient()

  const { data: exerciseTypes } = await supabase
    .from("exercise_types")
    .select("id, name, display_name")
    .order("display_name")

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Crear Ejercicio</h1>
      <Card>
        <CardHeader>
          <CardTitle>Nuevo Ejercicio</CardTitle>
          <CardDescription>
            Completa los datos generales y el contenido del ejercicio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateExerciseForm exerciseTypes={exerciseTypes ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
