"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function confirmGradeYear(gradeYear: number) {
  if (!Number.isInteger(gradeYear) || gradeYear < 1 || gradeYear > 6) {
    redirect("/ejercicios")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  await supabase
    .from("profiles")
    .update({
      grade_year: gradeYear,
      needs_grade_review: false,
      last_grade_confirmed_at: new Date().toISOString(),
      grade_year_updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  redirect("/ejercicios")
}
