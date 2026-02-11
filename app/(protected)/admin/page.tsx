import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, BookOpen, UserCheck } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: usersCount },
    { count: exercisesCount },
    { count: patientsCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("exercises").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "patient"),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-xl border bg-card p-3">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold">{exercisesCount || 0}</span>
          <span className="text-[11px] text-muted-foreground">Ejercicios</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl border bg-card p-3">
          <UserCheck className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold">{patientsCount || 0}</span>
          <span className="text-[11px] text-muted-foreground">Pacientes</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl border bg-card p-3">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold">{usersCount || 0}</span>
          <span className="text-[11px] text-muted-foreground">Usuarios</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/admin/usuarios"
          className="flex flex-col gap-2 rounded-xl border bg-card p-4 hover:border-primary transition-colors"
        >
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-sm">Usuarios</span>
          <span className="text-xs text-muted-foreground leading-snug">
            Crear y administrar cuentas
          </span>
        </Link>
        <Link
          href="/admin/ejercicios"
          className="flex flex-col gap-2 rounded-xl border bg-card p-4 hover:border-primary transition-colors"
        >
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-sm">Ejercicios</span>
          <span className="text-xs text-muted-foreground leading-snug">
            Crear y administrar ejercicios
          </span>
        </Link>
      </div>
    </div>
  );
}
