import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateUserForm } from "./create-user-form";
import { UsersList } from "./users-list";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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

      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <CardDescription>
              {usersWithDetails.length} usuarios registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersList users={usersWithDetails} currentUserId={user!.id} />
          </CardContent>
        </Card>

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
    </div>
  );
}
