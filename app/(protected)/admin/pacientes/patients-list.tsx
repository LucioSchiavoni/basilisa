"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { PatientSummary } from "./page";

export function PatientsList({ patients }: { patients: PatientSummary[] }) {
  const [search, setSearch] = useState("");

  const filtered = patients.filter((p) =>
    (p.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No se encontraron pacientes
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((patient) => (
            <Link key={patient.id} href={`/admin/pacientes/${patient.id}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border hover:border-primary transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {(patient.full_name || "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {patient.full_name || "Sin nombre"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {patient.exercises_completed} ejercicios completados
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap pl-13 sm:pl-0">
                  <Badge
                    variant={
                      patient.average_score >= 80
                        ? "default"
                        : patient.average_score >= 60
                          ? "secondary"
                          : "destructive"
                    }
                    className="text-xs"
                  >
                    {patient.average_score}% prom.
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1"
                    >
                      <path d="M6 3h12l4 6-10 13L2 9Z" />
                    </svg>
                    {patient.total_gems}
                  </Badge>
                  {patient.current_streak > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {patient.current_streak}d racha
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
