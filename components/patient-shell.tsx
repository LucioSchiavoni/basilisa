import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PatientBottomNav } from "@/components/patient-bottom-nav";
import { DobReminderBanner } from "@/components/profile-incomplete-banner";
import { HeaderControls } from "@/components/header-controls";

export async function PatientShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: gems }] = await Promise.all([
    supabase
      .from("profiles")
      .select("date_of_birth, role, needs_grade_review")
      .eq("id", user!.id)
      .single(),
    supabase
      .from("user_gems")
      .select("total_gems")
      .eq("user_id", user!.id)
      .single(),
  ]);

  if (profile?.role === "patient" && profile?.needs_grade_review) {
    redirect("/confirmar-grado");
  }

  const showBanner = !profile?.date_of_birth;

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-background" />
      <div className="min-h-dvh overflow-x-hidden p-4 pb-40 lg:pl-60 lg:pr-8 lg:py-8 lg:pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="sticky top-0 z-50 mb-4 min-h-14 lg:min-h-0">
            <div className="flex justify-between lg:justify-end items-center pt-0 lg:gap-3">
              {showBanner && (
                <div className="hidden lg:block">
                  <DobReminderBanner />
                </div>
              )}
              <HeaderControls totalGems={gems?.total_gems ?? 0} />
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
    </>
  );
}