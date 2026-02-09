import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateUserForm } from "./create-user-form";
import { UsersList } from "./users-list";

export default async function AdminUsersPage() {
  const adminClient = createAdminClient();

  const { data: authUsers } = await adminClient.auth.admin.listUsers();

  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, full_name, role, created_at, is_profile_complete")
    .order("created_at", { ascending: false });

  const usersWithDetails = (profiles ?? []).map((profile) => {
    const authUser = authUsers?.users?.find((au) => au.id === profile.id);
    const email = authUser?.email ?? "N/A";
    const isPatient = email.endsWith("@basilisa.internal");

    return {
      ...profile,
      email,
      is_patient: isPatient,
      username: isPatient ? email.replace("@basilisa.internal", "") : null,
      must_change_password: authUser?.user_metadata?.must_change_password === true,
    };
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gestión de Usuarios</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Crear Cuenta</CardTitle>
              <CardDescription>
                Añade un nuevo usuario o paciente al sistema
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
                {usersWithDetails.length} usuarios registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersList users={usersWithDetails} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
