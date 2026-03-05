"use server"

import { createClient } from "@/lib/supabase/server"

export type OnboardingState = { error?: string; success?: boolean }

export async function saveDateOfBirth(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const dateStr = formData.get("date_of_birth") as string
  if (!dateStr) return { error: "Seleccioná una fecha" }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Sin sesión" }

  const { error } = await supabase
    .from("profiles")
    .update({ date_of_birth: dateStr, updated_at: new Date().toISOString() })
    .eq("id", user.id)

  if (error) return { error: "No se pudo guardar la fecha" }
  return { success: true }
}
