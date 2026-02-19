import { createClient } from "@/lib/supabase/server";
import { ProfileButton } from "@/components/profile-button";
import { PatientBottomNav } from "@/components/patient-bottom-nav";
import { ConditionalThemeToggle } from "@/components/conditional-theme-toggle";
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
      <div className="fixed inset-0 -z-10 bg-background dark:[background:linear-gradient(to_bottom,#0f172a_0%,#1e293b_50%,#0f172a_100%)]" />
      <div className="min-h-screen p-4 pb-24 lg:p-8 lg:pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative z-50 flex justify-between items-center mb-6">
            <div className="flex items-center gap-1.5 rounded-2xl px-3 py-1.5 bg-card/80 border border-border dark:bg-black/35 dark:border-white/10 backdrop-blur-md shadow-sm">
              <GemIcon size={36} />
              <span className="text-xl lg:text-2xl font-bold text-foreground dark:text-white">
                {gems?.total_gems ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ConditionalThemeToggle />
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
