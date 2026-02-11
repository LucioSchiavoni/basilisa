import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { TriangleAlert } from "lucide-react"
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

  if (exercise.deleted_at) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Editar Ejercicio</h1>
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Ejercicio eliminado</AlertTitle>
          <AlertDescription>
            Este ejercicio fue eliminado el{" "}
            {new Date(exercise.deleted_at).toLocaleDateString("es", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            . Para editarlo, primero restauralo desde la lista de ejercicios eliminados.
          </AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/admin/ejercicios?show=deleted">Ver ejercicios eliminados</Link>
        </Button>
      </div>
    )
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
