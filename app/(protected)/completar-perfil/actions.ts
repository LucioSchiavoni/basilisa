"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "El nombre solo puede contener letras"),
  date_of_birth: z.string().min(1, "La fecha de nacimiento es requerida"),
  country_code: z.string().min(1, "El código de país es requerido"),
  phone: z
    .string()
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .regex(/^\d+$/, "El teléfono solo puede contener números"),
});

export type ProfileState = {
  error?: string;
  success?: string;
};

export async function completeProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const rawData = {
    full_name: formData.get("full_name") as string,
    date_of_birth: formData.get("date_of_birth") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
  };

  const parsed = profileSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No se encontró el usuario" };
  }

  const fullPhone = `${parsed.data.country_code}${parsed.data.phone}`;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      date_of_birth: parsed.data.date_of_birth,
      phone: fullPhone,
      is_profile_complete: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Error al guardar el perfil" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  redirect("/ejercicios");
}
