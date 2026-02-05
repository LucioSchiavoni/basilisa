import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateUserForm } from "./create-user-form";
import { UsersList } from "./users-list";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: authUsers } = await adminClient.auth.admin.listUsers();

  const { data: users } = await adminClient
    .from("profiles")
    .select("id, full_name, role, created_at, is_profile_complete")
    .order("created_at", { ascending: false });

  const usersWithEmail = users?.map((user) => {
    const authUser = authUsers?.users?.find((au) => au.id === user.id);
    return {
      ...user,
      email: authUser?.email || "N/A",
    };
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gestión de Usuarios</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Crear Usuario</CardTitle>
              <CardDescription>
                Añade un nuevo usuario al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateUserForm />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>
                {usersWithEmail?.length || 0} usuarios registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersList users={usersWithEmail || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
