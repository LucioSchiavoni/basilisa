import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <form action={logout}>
            <Button variant="outline" type="submit">
              Cerrar Sesión
            </Button>
          </form>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Bienvenido</CardTitle>
            <CardDescription>Has iniciado sesión correctamente</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Email: {user?.email}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
