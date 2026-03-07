import { createClient } from "@/lib/supabase/server";
import { PatientBottomNav } from "@/components/patient-bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { GemIcon } from "@/components/gem-icon";
import { WorldThemeProvider } from "@/components/world-theme-context";
import { ForceDarkOnWorldPages } from "@/components/force-dark-on-world-pages";
import { DobReminderBanner } from "@/components/profile-incomplete-banner";

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
      .select("date_of_birth")
      .eq("id", user!.id)
      .single(),
    supabase
      .from("user_gems")
      .select("total_gems")
      .eq("user_id", user!.id)
      .single(),
  ]);

  const showBanner = !profile?.date_of_birth;

  return (
    <WorldThemeProvider>
      <ForceDarkOnWorldPages />
      <div className="fixed inset-0 -z-10 bg-background" />
      <div className="min-h-dvh overflow-x-hidden p-4 pb-40 lg:pl-60 lg:pr-8 lg:py-8 lg:pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="sticky top-0 z-50 mb-4">
            <div className="flex justify-between lg:justify-end items-center pt-0 lg:gap-3">
              <div className="flex lg:hidden items-center gap-1 rounded-2xl px-2.5 py-1 bg-card/80 border border-border dark:bg-black/35 dark:border-white/10 backdrop-blur-md shadow-sm">
                <GemIcon size={28} />
                <span className="text-base font-bold text-foreground dark:text-white">
                  {gems?.total_gems ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {showBanner && (
                  <div className="hidden lg:block">
                    <DobReminderBanner />
                  </div>
                )}
                <div className="hidden lg:flex items-center gap-1.5 rounded-2xl px-3 py-1.5 bg-card/80 border border-border dark:bg-black/35 dark:border-white/10 backdrop-blur-md shadow-sm">
                  <GemIcon size={34} />
                  <span className="text-2xl font-bold text-foreground dark:text-white">
                    {gems?.total_gems ?? 0}
                  </span>
                </div>
                <ThemeToggle className="flex items-center justify-center h-9 w-9 lg:h-11 lg:w-11 rounded-full bg-card/80 border border-border dark:bg-black/35 dark:border-white/10 backdrop-blur-md shadow-sm text-foreground dark:text-white hover:bg-card/90 transition-colors" />
              </div>
            </div>
            {showBanner && (
              <div className="mt-2 lg:hidden">
                <DobReminderBanner />
              </div>
            )}
          </div>
          {children}
        </div>
      </div>
      <PatientBottomNav />
    </WorldThemeProvider>
  );
}
