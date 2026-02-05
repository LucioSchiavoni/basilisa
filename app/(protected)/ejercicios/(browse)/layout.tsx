import { createClient } from "@/lib/supabase/server";
import { ProfileButton } from "@/components/profile-button";
import { EjerciciosNav } from "./ejercicios-nav";

export default async function BrowseEjerciciosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_profile_complete")
    .eq("id", user!.id)
    .single();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            Hola, {profile?.full_name || "Paciente"}
          </h1>
          <ProfileButton
            fullName={profile?.full_name ?? null}
            email={user!.email!}
            isProfileComplete={profile?.is_profile_complete ?? false}
          />
        </div>
        <EjerciciosNav />
        {children}
      </div>
    </div>
  );
}
