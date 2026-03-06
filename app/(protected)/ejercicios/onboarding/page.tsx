import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OnboardingClient } from "./onboarding-client"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("date_of_birth")
    .eq("id", user!.id)
    .single()

  if (profile?.date_of_birth) redirect("/ejercicios")

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse 130% 90% at 50% 45%, #fdf9f4 0%, #faf3ea 50%, #f6ece0 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 78%, rgba(251,222,200,0.35) 0%, transparent 52%), radial-gradient(circle at 82% 18%, rgba(248,216,190,0.28) 0%, transparent 48%)",
        }}
      />
      <OnboardingClient />
    </div>
  )
}
