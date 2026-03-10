import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GradeReviewClient } from "./grade-review-client"

export default async function ConfirmarGradoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("grade_year, role, needs_grade_review")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "patient" || !profile.needs_grade_review) {
    redirect("/ejercicios")
  }

  return <GradeReviewClient gradeYear={profile.grade_year ?? 1} />
}
