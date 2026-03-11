"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, Gem, Flame, ChevronRight } from "lucide-react";
import type { PatientSummary } from "./page";

function PatientInitials({ name }: { name: string | null }) {
  const initials = (name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
      {initials}
    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : score >= 60
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
        : score === 0
          ? "bg-muted text-muted-foreground"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {score === 0 ? "—" : `${score}%`}
    </span>
  );
}

export function PatientsList({ patients }: { patients: PatientSummary[] }) {
  const [search, setSearch] = useState("");

  const filtered = patients.filter((p) =>
    (p.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No se encontraron pacientes
        </p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground sm:px-4">Paciente</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground hidden sm:table-cell w-28">Promedio</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground hidden sm:table-cell w-32">Gemas / Racha</th>
                <th className="px-2 py-2.5 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((patient) => (
                <tr
                  key={patient.id}
                  className="bg-card hover:bg-muted/20 transition-colors cursor-pointer"
                >
                  <td className="px-3 py-2.5 sm:px-4">
                    <Link href={`/admin/pacientes/${patient.id}`} className="flex items-center gap-2 min-w-0">
                      <PatientInitials name={patient.full_name} />
                      <div className="min-w-0">
                        <p className="font-medium truncate leading-tight text-[13px]">
                          {patient.full_name || "Sin nombre"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {patient.exercises_completed} ejercicios completados
                        </p>
                        <div className="flex items-center gap-2 mt-1 sm:hidden">
                          <ScorePill score={patient.average_score} />
                          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <Gem className="h-3 w-3" />
                            {patient.total_gems}
                          </span>
                          {patient.current_streak > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <Flame className="h-3 w-3" />
                              {patient.current_streak}d
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </td>

                  <td className="px-3 py-2.5 hidden sm:table-cell">
                    <Link href={`/admin/pacientes/${patient.id}`} className="block">
                      <ScorePill score={patient.average_score} />
                    </Link>
                  </td>

                  <td className="px-3 py-2.5 hidden sm:table-cell">
                    <Link href={`/admin/pacientes/${patient.id}`} className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Gem className="h-3.5 w-3.5" />
                        {patient.total_gems}
                      </span>
                      {patient.current_streak > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Flame className="h-3.5 w-3.5" />
                          {patient.current_streak}d
                        </span>
                      )}
                    </Link>
                  </td>

                  <td className="pl-0 pr-3 py-2.5 sm:px-4">
                    <Link href={`/admin/pacientes/${patient.id}`} className="flex justify-end mr-1 sm:mr-0">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
