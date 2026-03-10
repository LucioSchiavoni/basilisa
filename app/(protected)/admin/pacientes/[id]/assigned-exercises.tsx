"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { X, Calendar, Clock, FileText, ChevronDown } from "lucide-react";
import { cancelAssignment } from "../../actions";

type Assignment = {
  id: string;
  exerciseTitle: string;
  status: string;
  assignedAt: string;
  dueDate: string | null;
  notesForPatient: string | null;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  assigned: { label: "Pendiente", variant: "secondary" },
  pending: { label: "Pendiente", variant: "secondary" },
  in_progress: { label: "En progreso", variant: "default" },
  completed: { label: "Completado", variant: "outline" },
};

export function AssignedExercises({
  assignments,
  patientId,
}: {
  assignments: Assignment[];
  patientId: string;
}) {
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  async function handleCancel(assignmentId: string) {
    setCancelling(assignmentId);
    const result = await cancelAssignment(assignmentId, patientId);
    setCancelling(null);
    if (result.error) alert(result.error);
  }

  return (
    <Card
      className={`cursor-pointer transition-shadow duration-200 ${!open ? "hover:shadow-md" : ""}`}
      onClick={() => setOpen((v) => !v)}
    >
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base">Ejercicios asignados</span>
            {assignments.length > 0 && (
              <span className="text-xs text-muted-foreground font-normal">
                ({assignments.length})
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </div>

        {open && (
          <div
            className="px-5 pb-5 space-y-3 border-t pt-4"
            onClick={(e) => e.stopPropagation()}
          >
            {assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay ejercicios asignados pendientes.
              </p>
            ) : (
              assignments.map((a) => {
                const isCompleted = a.status === "completed";
                const isOverdue = !isCompleted && a.dueDate && new Date(a.dueDate) < new Date();
                const config = isOverdue
                  ? { label: "Vencido", variant: "destructive" as const }
                  : statusConfig[a.status] || { label: a.status, variant: "outline" as const };

                return (
                  <div
                    key={a.id}
                    className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${isCompleted ? "opacity-60" : ""}`}
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{a.exerciseTitle}</p>
                        <Badge variant={config.variant} className="text-[10px]">
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(a.assignedAt)}
                        </span>
                        {a.dueDate && (
                          <span className={`flex items-center gap-1 ${isOverdue ? "text-destructive" : ""}`}>
                            <Calendar className="h-3 w-3" />
                            {formatDate(a.dueDate)}
                          </span>
                        )}
                      </div>
                      {a.notesForPatient && (
                        <p className="text-xs text-muted-foreground flex items-start gap-1">
                          <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                          {a.notesForPatient}
                        </p>
                      )}
                    </div>
                    {!isCompleted && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                            disabled={cancelling === a.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Desasignar ejercicio</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro de que querés desasignar &ldquo;{a.exerciseTitle}&rdquo;? El paciente ya no lo verá en sus ejercicios pendientes.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => handleCancel(a.id)}
                            >
                              Desasignar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {!open && (
          <div className="group px-5 pb-4">
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-150">
              Ver más
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
