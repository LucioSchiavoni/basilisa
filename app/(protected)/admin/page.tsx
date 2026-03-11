import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Users, BookOpen, UserCheck } from "lucide-react";
import { AssignExercisesDashboardDialog } from "./assign-exercises-dialog";
import { CreateUserDialog } from "./create-user-dialog";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const [
    { count: usersCount },
    { count: exercisesCount },
    { count: patientsCount },
    { data: patients },
    { data: exercises },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("exercises").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "patient"),
    adminClient.from("profiles").select("id, full_name, role, email").eq("role", "patient").eq("is_active", true),
    supabase.from("exercises").select("id, title, difficulty_level, exercise_types(display_name)").eq("is_active", true).is("deleted_at", null).order("title"),
  ]);

  const patientsList = (patients ?? []).map((p) => {
    const isPatient = (p.email ?? "").endsWith("@basilisa.internal");
    return {
      id: p.id,
      full_name: p.full_name,
      username: isPatient ? (p.email ?? "").replace("@basilisa.internal", "") : null,
      is_patient: isPatient,
    };
  });

  const exercisesList = (exercises ?? []).map((e) => {
    const et = e.exercise_types as { display_name: string } | null;
    return {
      id: e.id,
      title: e.title,
      exerciseTypeDisplayName: et?.display_name ?? "Sin tipo",
      difficultyLevel: e.difficulty_level,
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <Link href="/admin/ejercicios" className="flex flex-col items-center gap-1 rounded-xl border bg-card p-3 hover:border-primary hover:bg-accent transition-colors cursor-pointer">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold">{exercisesCount || 0}</span>
          <span className="text-[11px] text-muted-foreground">Ejercicios</span>
        </Link>
        <Link href="/admin/pacientes" className="flex flex-col items-center gap-1 rounded-xl border bg-card p-3 hover:border-primary hover:bg-accent transition-colors cursor-pointer">
          <UserCheck className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold">{patientsCount || 0}</span>
          <span className="text-[11px] text-muted-foreground">Pacientes</span>
        </Link>
        <Link href="/admin/usuarios" className="flex flex-col items-center gap-1 rounded-xl border bg-card p-3 hover:border-primary hover:bg-accent transition-colors cursor-pointer">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold">{usersCount || 0}</span>
          <span className="text-[11px] text-muted-foreground">Usuarios</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AssignExercisesDashboardDialog
          patients={patientsList}
          exercises={exercisesList}
        />
        <CreateUserDialog />
      </div>

    </div>
  );
}
