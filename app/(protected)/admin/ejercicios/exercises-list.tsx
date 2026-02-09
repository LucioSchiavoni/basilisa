"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteExercise } from "../actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";

type Exercise = {
  id: string;
  title: string;
  instructions: string;
  difficulty_level: number;
  estimated_time_seconds: number;
  is_active: boolean;
  created_at: string;
};

const difficultyLabels: Record<number, string> = {
  1: "Muy facil",
  2: "Facil",
  3: "Intermedio",
  4: "Dificil",
  5: "Muy dificil",
};

const difficultyColors: Record<number, string> = {
  1: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  2: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  3: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  4: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  5: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function ExercisesList({ exercises }: { exercises: Exercise[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("¿Estas seguro de que deseas eliminar este ejercicio?")) {
      return;
    }

    setDeleting(id);
    const result = await deleteExercise(id);
    setDeleting(null);

    if (result.error) {
      alert(result.error);
    }
  }

  if (exercises.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No hay ejercicios creados
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {exercises.map((exercise) => (
        <div
          key={exercise.id}
          className="flex items-start justify-between p-4 border rounded-lg"
        >
          <Link
            href={`/admin/ejercicios/${exercise.id}`}
            className="space-y-2 flex-1 hover:opacity-70 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <p className="font-medium">{exercise.title}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  difficultyColors[exercise.difficulty_level] || difficultyColors[3]
                }`}
              >
                {difficultyLabels[exercise.difficulty_level] || `Nivel ${exercise.difficulty_level}`}
              </span>
              {!exercise.is_active && (
                <Badge variant="secondary">Inactivo</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {exercise.instructions}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatTime(exercise.estimated_time_seconds)}
            </p>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(exercise.id);
            }}
            disabled={deleting === exercise.id}
            className="ml-4"
          >
            {deleting === exercise.id ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      ))}
    </div>
  );
}
