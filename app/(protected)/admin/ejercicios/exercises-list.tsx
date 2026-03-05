"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteExercise, restoreExercise } from "../actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2, RotateCcw, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Exercise = {
  id: string;
  title: string;
  instructions: string | null;
  difficulty_level: number;
  is_active: boolean;
  created_at: string;
  tags: string[] | null;
  deleted_at: string | null;
  world_name: string | null;
};

const difficultyLabels: Record<number, string> = {
  1: "Muy facil",
  2: "Facil",
  3: "Intermedio",
  4: "Intermedio-Alto",
  5: "Dificil",
  6: "Muy dificil",
};

const difficultyColors: Record<number, string> = {
  1: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  2: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  3: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  4: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  5: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  6: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function ExercisesList({ exercises, showDeleted = false }: { exercises: Exercise[]; showDeleted?: boolean }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");

  const allTags = Array.from(new Set(exercises.flatMap((e) => e.tags ?? []))).sort();

  const filtered = exercises.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || e.difficulty_level === Number(difficultyFilter);
    const matchesTag = tagFilter === "all" || (e.tags ?? []).includes(tagFilter);
    return matchesSearch && matchesDifficulty && matchesTag;
  });

  const hasFilters = search !== "" || difficultyFilter !== "all" || tagFilter !== "all";

  async function handleDelete(id: string) {
    setLoading(id);
    setError(null);
    const result = await deleteExercise(id);
    setLoading(null);

    if (result.error) {
      setError(result.error);
    }
  }

  async function handleRestore(id: string) {
    setLoading(id);
    setError(null);
    const result = await restoreExercise(id);
    setLoading(null);

    if (result.error) {
      setError(result.error);
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
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Dificultad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las dificultades</SelectItem>
            {Object.entries(difficultyLabels).map(([level, label]) => (
              <SelectItem key={level} value={level}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {allTags.length > 0 && (
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Etiqueta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las etiquetas</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(""); setDifficultyFilter("all"); setTagFilter("all"); }}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="text-muted-foreground text-center py-8">Sin resultados</p>
      )}

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md dark:bg-red-900/20">
          {error}
        </div>
      )}

      {filtered.map((exercise) => (
        <div
          key={exercise.id}
          className="flex items-start justify-between gap-3 p-4 border rounded-lg"
        >
          <Link
            href={`/admin/ejercicios/${exercise.id}`}
            className="space-y-2 flex-1 min-w-0 hover:opacity-70 transition-opacity"
          >
            <p className="font-medium leading-snug">{exercise.title}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                  difficultyColors[exercise.difficulty_level] || difficultyColors[3]
                }`}
              >
                {difficultyLabels[exercise.difficulty_level] || `Nivel ${exercise.difficulty_level}`}
              </span>
{!exercise.is_active && (
                <Badge variant="secondary" className="shrink-0">Inactivo</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {exercise.instructions}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {exercise.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          </Link>

          {showDeleted ? (
            <Button
              variant="outline"
              size="icon"
              className="ml-4 shrink-0"
              disabled={loading === exercise.id}
              onClick={() => handleRestore(exercise.id)}
            >
              {loading === exercise.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  className="ml-4 shrink-0"
                  disabled={loading === exercise.id}
                >
                  {loading === exercise.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar ejercicio</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vas a eliminar <span className="font-semibold text-foreground">{exercise.title}</span>. El ejercicio se podra restaurar despues.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(exercise.id)}
                    className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      ))}
    </div>
  );
}
