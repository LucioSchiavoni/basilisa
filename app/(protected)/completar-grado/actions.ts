"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function saveGradeYear(gradeYear: number) {
  if (!Number.isInteger(gradeYear) || gradeYear < 1 || gradeYear > 6) {
    redirect("/login")
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
      grade_year_updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role === "admin") redirect("/admin")
  redirect("/ejercicios")
}
