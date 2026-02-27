import { createClient } from "@/lib/supabase/server";
import { ProfileButton } from "@/components/profile-button";
import { PatientBottomNav } from "@/components/patient-bottom-nav";

import { GemIcon } from "@/components/gem-icon";
import { WorldThemeProvider } from "@/components/world-theme-context";
import { ForceDarkOnWorldPages } from "@/components/force-dark-on-world-pages";

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
    <WorldThemeProvider>
      <ForceDarkOnWorldPages />
      <div className="fixed inset-0 -z-10 bg-background" />
      <div className="min-h-dvh overflow-x-hidden p-4 pb-24 lg:p-8 lg:pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="sticky top-0 z-50 flex justify-between items-center mb-4 pt-0">
            <div className="flex items-center gap-1 rounded-2xl px-2.5 py-1 bg-card/80 border border-border dark:bg-black/35 dark:border-white/10 backdrop-blur-md shadow-sm">
              <GemIcon size={28} />
              <span className="text-base lg:text-xl font-bold text-foreground dark:text-white">
                {gems?.total_gems ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ProfileButton
                fullName={profile?.full_name ?? null}
                email={user!.email!}
                isProfileComplete={profile?.is_profile_complete ?? false}
              />
            </div>
          </div>
          {children}
        </div>
      </div>
      <PatientBottomNav />
    </WorldThemeProvider>
  );
}
