"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Search, Check } from "lucide-react";
import { assignExercise } from "../../actions";

type Exercise = {
  id: string;
  title: string;
  exerciseTypeDisplayName: string;
  difficultyLevel: number;
};

export function AssignExerciseDialog({
  patientId,
  exercises,
}: {
  patientId: string;
  exercises: Exercise[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = exercises.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  function resetForm() {
    setSearch("");
    setSelectedExerciseId(null);
    setDueDate("");
    setNotes("");
    setError(null);
  }

  async function handleSubmit() {
    if (!selectedExerciseId) return;

    setLoading(true);
    setError(null);

    const result = await assignExercise({
      patientId,
      exerciseId: selectedExerciseId,
      dueDate: dueDate || null,
      notesForPatient: notes || null,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    resetForm();
    setOpen(false);
  }

  const difficultyLabel = (level: number) => {
    const labels: Record<number, string> = {
      1: "Muy fácil",
      2: "Fácil",
      3: "Medio",
      4: "Difícil",
      5: "Muy difícil",
    };
    return labels[level] || `Nivel ${level}`;
  };

  const difficultyVariant = (level: number) => {
    if (level <= 2) return "secondary" as const;
    if (level <= 3) return "default" as const;
    return "destructive" as const;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Asignar ejercicio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Asignar ejercicio</DialogTitle>
          <DialogDescription>
            Selecciona un ejercicio para asignar al paciente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ejercicio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-48 overflow-y-auto border rounded-md">
            {filtered.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">
                No se encontraron ejercicios
              </p>
            ) : (
              filtered.map((exercise) => (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => setSelectedExerciseId(exercise.id)}
                  className={`w-full text-left px-3 py-2.5 border-b last:border-b-0 transition-colors hover:bg-accent/50 flex items-center justify-between gap-2 ${
                    selectedExerciseId === exercise.id
                      ? "bg-accent"
                      : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {exercise.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[10px]">
                        {exercise.exerciseTypeDisplayName}
                      </Badge>
                      <Badge
                        variant={difficultyVariant(exercise.difficultyLevel)}
                        className="text-[10px]"
                      >
                        {difficultyLabel(exercise.difficultyLevel)}
                      </Badge>
                    </div>
                  </div>
                  {selectedExerciseId === exercise.id && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Fecha límite (opcional)</Label>
            <Input
              id="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas para el paciente (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Instrucciones adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              setOpen(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedExerciseId || loading}
          >
            {loading ? "Asignando..." : "Asignar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
