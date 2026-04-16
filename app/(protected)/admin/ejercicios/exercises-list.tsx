"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteExercise, restoreExercise } from "../actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Trash2, Loader2, RotateCcw, Search, X, Pencil } from "lucide-react";

type Exercise = {
  id: string;
  title: string;
  instructions: string | object | null;
  difficulty_level: number;
  is_active: boolean;
  created_at: string;
  tags: string[] | null;
  deleted_at: string | null;
  world_name: string | null;
};

type PendingDelete = { id: string; title: string };

const difficultyLabels: Record<number, string> = {
  1: "Muy fácil",
  2: "Fácil",
  3: "Intermedio",
  4: "Inter. Alto",
  5: "Difícil",
  6: "Muy difícil",
};

const difficultyColors: Record<number, string> = {
  1: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  2: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  3: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  4: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  5: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  6: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function DifficultyBadge({ level }: { level: number }) {
  return (
    <span className={`text-[10px] leading-none px-1.5 py-[3px] rounded-full whitespace-nowrap ${difficultyColors[level] ?? difficultyColors[3]}`}>
      {difficultyLabels[level] ?? `Nivel ${level}`}
    </span>
  );
}

export function ExercisesList({
  exercises,
  showDeleted = false,
}: {
  exercises: Exercise[];
  showDeleted?: boolean;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [worldFilter, setWorldFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const allWorlds = Array.from(
    new Set(exercises.map((e) => e.world_name).filter((w): w is string => !!w))
  ).sort();

  const filtered = exercises.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === "all" || e.difficulty_level === Number(difficultyFilter);
    const matchesWorld =
      worldFilter === "all" || e.world_name === worldFilter;
    return matchesSearch && matchesDifficulty && matchesWorld;
  });

  const hasFilters = search !== "" || difficultyFilter !== "all" || worldFilter !== "all";

  async function confirmDelete() {
    if (!pendingDelete) return;
    setLoading(pendingDelete.id);
    setError(null);
    const result = await deleteExercise(pendingDelete.id);
    setLoading(null);
    if (result.error) setError(result.error);
    setPendingDelete(null);
  }

  async function handleRestore(id: string) {
    setLoading(id);
    setError(null);
    const result = await restoreExercise(id);
    setLoading(null);
    if (result.error) setError(result.error);
  }

  if (exercises.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No hay ejercicios {showDeleted ? "eliminados" : "creados"}
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="h-9 text-sm w-[140px]">
                <SelectValue placeholder="Dificultad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(difficultyLabels).map(([level, label]) => (
                  <SelectItem key={level} value={level}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {allWorlds.length > 0 && (
              <Select value={worldFilter} onValueChange={setWorldFilter}>
                <SelectTrigger className="h-9 text-sm w-[140px]">
                  <SelectValue placeholder="Mundo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los mundos</SelectItem>
                  {allWorlds.map((world) => (
                    <SelectItem key={world} value={world}>{world}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-muted-foreground px-2"
                onClick={() => { setSearch(""); setDifficultyFilter("all"); setWorldFilter("all"); }}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">
            {error}
          </p>
        )}

        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 text-sm">Sin resultados</p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground sm:px-4">
                    Ejercicio
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground/60">
                      {filtered.length}
                    </span>
                  </th>
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground hidden sm:table-cell w-28">
                    Dificultad
                  </th>
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground hidden md:table-cell w-32">
                    Mundo
                  </th>
                  <th className="px-2 py-2.5 w-16 sm:w-24 sm:px-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((exercise) => (
                  <tr
                    key={exercise.id}
                    className="bg-card hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-3 py-3 sm:px-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/admin/ejercicios/${exercise.id}`}
                            className="font-medium text-[13px] leading-tight hover:text-primary transition-colors truncate"
                          >
                            {exercise.title}
                          </Link>
                          {!exercise.is_active && (
                            <span className="text-[10px] leading-none px-1.5 py-[3px] rounded-full bg-muted text-muted-foreground whitespace-nowrap">
                              Inactivo
                            </span>
                          )}
                        </div>
                        {exercise.instructions && typeof exercise.instructions === "string" && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {exercise.instructions}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className="sm:hidden">
                            <DifficultyBadge level={exercise.difficulty_level} />
                          </span>
                          {exercise.world_name && (
                            <span className="md:hidden text-[10px] leading-none px-1.5 py-[3px] rounded-full bg-muted text-muted-foreground whitespace-nowrap">
                              {exercise.world_name}
                            </span>
                          )}
                          {(exercise.tags ?? []).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] leading-none px-1.5 py-[3px] rounded-full border text-muted-foreground whitespace-nowrap"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3 hidden sm:table-cell">
                      <DifficultyBadge level={exercise.difficulty_level} />
                    </td>

                    <td className="px-3 py-3 hidden md:table-cell">
                      {exercise.world_name ? (
                        <span className="text-xs text-muted-foreground">
                          {exercise.world_name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </td>

                    <td className="pl-1 pr-3 py-3 sm:px-3">
                      <div className="flex gap-1 justify-end mr-1 sm:mr-0">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          asChild
                          title="Editar ejercicio"
                        >
                          <Link href={`/admin/ejercicios/${exercise.id}`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        {showDeleted ? (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            disabled={loading === exercise.id}
                            onClick={() => handleRestore(exercise.id)}
                            title="Restaurar ejercicio"
                          >
                            {loading === exercise.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-7 w-7"
                            disabled={loading === exercise.id}
                            onClick={() => setPendingDelete({ id: exercise.id, title: exercise.title })}
                            title="Eliminar ejercicio"
                          >
                            {loading === exercise.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar ejercicio</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar{" "}
              <span className="font-semibold text-foreground">{pendingDelete?.title}</span>.
              El ejercicio se puede restaurar después.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
