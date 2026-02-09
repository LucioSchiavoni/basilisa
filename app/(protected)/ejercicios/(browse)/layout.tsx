import { createClient } from "@/lib/supabase/server";
import { ProfileButton } from "@/components/profile-button";
import { PatientBottomNav } from "@/components/patient-bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { EjerciciosNav } from "./ejercicios-nav";
import { Gem } from "lucide-react";

export default async function BrowseEjerciciosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: gems }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, is_profile_complete")
      .eq("id", user!.id)
      .single(),
    supabase
      .from("user_gems")
      .select("total_gems")
      .eq("user_id", user!.id)
      .single(),
  ]);

  return (
    <div className="min-h-screen p-4 pb-20 lg:p-8 lg:pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Gem className="h-6 w-6 text-yellow-500" />
            <span className="text-2xl lg:text-3xl font-bold">
              {gems?.total_gems ?? 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden lg:block">
              <ProfileButton
                fullName={profile?.full_name ?? null}
                email={user!.email!}
                isProfileComplete={profile?.is_profile_complete ?? false}
              />
            </div>
          </div>
        </div>
        <div className="hidden lg:block">
          <EjerciciosNav />
        </div>
        {children}
      </div>
      <PatientBottomNav />
    </div>
  );
}
