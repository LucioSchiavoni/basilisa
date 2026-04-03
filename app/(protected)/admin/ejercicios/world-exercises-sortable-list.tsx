"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { GripVertical, Loader2, Pencil, TriangleAlert } from "lucide-react";
import { reorderWorldExercises } from "../actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WorldExerciseItem = {
  id: string;
  position: number;
  is_bonus: boolean;
  exercise: {
    id: string;
    title: string;
    instructions: string | null;
    difficulty_level: number;
    is_active: boolean;
    deleted_at: string | null;
    type_name: string | null;
  } | null;
};

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

const difficultyLabels: Record<number, string> = {
  1: "Muy fácil",
  2: "Fácil",
  3: "Intermedio",
  4: "Intermedio alto",
  5: "Difícil",
  6: "Muy difícil",
};

export function WorldExercisesSortableList({
  worldId,
  items: initialItems,
}: {
  worldId: string;
  items: WorldExerciseItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [lastSavedItems, setLastSavedItems] = useState(initialItems);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ error?: string; success?: string }>({});
  const [isPending, startTransition] = useTransition();

  const orderedItems = useMemo(
    () => items.map((item, index) => ({ ...item, position: index + 1 })),
    [items]
  );

  function persistOrder(nextItems: WorldExerciseItem[]) {
    setStatus({});
    startTransition(async () => {
      const result = await reorderWorldExercises({
        worldId,
        orderedWorldExerciseIds: nextItems.map((item) => item.id),
      });

      if (result.error) {
        setItems(lastSavedItems);
        setStatus({ error: result.error });
        return;
      }

      setLastSavedItems(nextItems);
      setStatus({ success: "Orden guardado" });
    });
  }

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId || isPending) {
      setDraggingId(null);
      setDropTargetId(null);
      return;
    }

    const fromIndex = items.findIndex((item) => item.id === draggingId);
    const toIndex = items.findIndex((item) => item.id === targetId);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      setDraggingId(null);
      setDropTargetId(null);
      return;
    }

    const nextItems = moveItem(items, fromIndex, toIndex);
    setItems(nextItems);
    setDraggingId(null);
    setDropTargetId(null);
    persistOrder(nextItems);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <h2 className="font-semibold">Orden del mundo</h2>
            <p className="text-sm text-muted-foreground">
              Arrastrá los ejercicios para definir el orden en que aparecen.
            </p>
          </div>
          {isPending && (
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando
            </div>
          )}
        </div>

        <div className="divide-y">
          {orderedItems.map((item) => {
            const exercise = item.exercise;
            const isDragging = draggingId === item.id;
            const isDropTarget = dropTargetId === item.id && draggingId !== item.id;

            return (
              <div
                key={item.id}
                draggable={!isPending}
                onDragStart={(event) => {
                  setDraggingId(item.id);
                  setStatus({});
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", item.id);
                }}
                onDragOver={(event) => {
                  if (isPending) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  if (dropTargetId !== item.id) setDropTargetId(item.id);
                }}
                onDragLeave={() => {
                  if (dropTargetId === item.id) setDropTargetId(null);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  handleDrop(item.id);
                }}
                onDragEnd={() => {
                  setDraggingId(null);
                  setDropTargetId(null);
                }}
                className={cn(
                  "flex cursor-grab items-start gap-3 px-4 py-3 transition-colors active:cursor-grabbing",
                  isDragging && "opacity-50",
                  isDropTarget && "bg-accent/60"
                )}
              >
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {item.position}
                  </div>
                  <button
                    type="button"
                    className="cursor-grab rounded-md p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
                    aria-label={`Mover ${exercise?.title ?? "ejercicio"}`}
                    disabled={isPending}
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  {exercise ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/ejercicios/${exercise.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {exercise.title}
                        </Link>
                        {item.is_bonus && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">
                            Bonus
                          </span>
                        )}
                        {!exercise.is_active && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                            Inactivo
                          </span>
                        )}
                        {exercise.deleted_at && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] text-red-700">
                            Eliminado
                          </span>
                        )}
                        {exercise.type_name && (
                          <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                            {exercise.type_name}
                          </span>
                        )}
                        <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                          {difficultyLabels[exercise.difficulty_level] ?? `Nivel ${exercise.difficulty_level}`}
                        </span>
                      </div>

                      {exercise.instructions && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {exercise.instructions}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <TriangleAlert className="h-4 w-4" />
                      No se pudo cargar el ejercicio relacionado.
                    </div>
                  )}
                </div>

                {exercise && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/ejercicios/${exercise.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {status.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {status.error}
        </p>
      )}
      {status.success && !status.error && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {status.success}
        </p>
      )}
    </div>
  );
}
