import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: usersCount },
    { count: exercisesCount },
    { count: patientsCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("exercises").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "patient"),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardDescription>Total Usuarios</CardDescription>
            <CardTitle className="text-4xl">{usersCount || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pacientes</CardDescription>
            <CardTitle className="text-4xl">{patientsCount || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Ejercicios</CardDescription>
            <CardTitle className="text-4xl">{exercisesCount || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/usuarios">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>Gestionar Usuarios</CardTitle>
              <CardDescription>
                Crear y administrar cuentas de pacientes y administradores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Crea nuevos usuarios, asigna roles y gestiona permisos
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/ejercicios">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>Gestionar Ejercicios</CardTitle>
              <CardDescription>
                Crear y administrar ejercicios para pacientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Crea ejercicios, define categorías y asigna a pacientes
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
