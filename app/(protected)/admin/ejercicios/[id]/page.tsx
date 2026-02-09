import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EditExerciseForm } from "./edit-exercise-form"

export default async function EditExercisePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: exercise }, { data: exerciseTypes }] = await Promise.all([
    supabase
      .from("exercises")
      .select("*, exercise_types(name, display_name)")
      .eq("id", id)
      .single(),
    supabase
      .from("exercise_types")
      .select("id, name, display_name")
      .order("display_name"),
  ])

  if (!exercise) {
    notFound()
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Editar Ejercicio</h1>
      <Card>
        <CardHeader>
          <CardTitle>{exercise.title}</CardTitle>
          <CardDescription>
            Modifica los datos del ejercicio y guarda los cambios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditExerciseForm
            exercise={exercise}
            exerciseTypes={exerciseTypes ?? []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
