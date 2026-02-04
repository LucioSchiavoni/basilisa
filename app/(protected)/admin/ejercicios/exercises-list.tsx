"use client";

import { useState } from "react";
import { deleteExercise } from "../actions";
import { Button } from "@/components/ui/button";

type Exercise = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  instructions: string | null;
  created_at: string;
};

const difficultyLabels: Record<string, string> = {
  easy: "Fácil",
  medium: "Media",
  hard: "Difícil",
};

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function ExercisesList({ exercises }: { exercises: Exercise[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de que deseas eliminar este ejercicio?")) {
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
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{exercise.title}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  difficultyColors[exercise.difficulty] || difficultyColors.easy
                }`}
              >
                {difficultyLabels[exercise.difficulty] || exercise.difficulty}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {exercise.description}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {exercise.category}
              </span>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(exercise.id)}
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
