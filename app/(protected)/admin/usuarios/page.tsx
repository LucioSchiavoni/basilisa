import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { CreateUserForm } from "./create-user-form";
import { UsersList } from "./users-list";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminClient = createAdminClient();

  const { data: authUsers } = await adminClient.auth.admin.listUsers();

  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, full_name, role, created_at, is_profile_complete, needs_grade_review, grade_year")
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
    <div className="space-y-10">
      <h1 className="text-2xl font-bold sm:text-3xl">Gestión de Usuarios</h1>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Usuarios</h2>
          <p className="text-sm text-muted-foreground">{usersWithDetails.length} registrados</p>
        </div>
        <UsersList users={usersWithDetails} currentUserId={user!.id} />
      </section>

      <div className="border-t" />

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Crear Cuenta</h2>
          <p className="text-sm text-muted-foreground">Añade un nuevo usuario o paciente</p>
        </div>
        <div className="max-w-md">
          <CreateUserForm />
        </div>
      </section>
    </div>
  );
}
