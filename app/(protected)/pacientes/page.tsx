import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PacientesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user?.id)
    .single();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mis Pacientes</h1>
          <form action={logout}>
            <Button variant="outline" type="submit">
              Cerrar Sesión
            </Button>
          </form>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Bienvenido, {profile?.full_name || "Experto"}</CardTitle>
            <CardDescription>
              Gestiona tus pacientes desde aquí
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No tienes pacientes asignados todavía.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
