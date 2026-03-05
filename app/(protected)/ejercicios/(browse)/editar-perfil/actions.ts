"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  full_name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "El nombre solo puede contener letras"),
  country_code: z.string().min(1, "El código de país es requerido"),
  phone: z
    .string()
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .regex(/^\d+$/, "El teléfono solo puede contener números"),
  avatar_url: z.string().optional(),
});

export type EditProfileState = { error?: string };

export async function editProfile(
  _prev: EditProfileState,
  formData: FormData
): Promise<EditProfileState> {
  const raw = {
    full_name: formData.get("full_name") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    avatar_url: (formData.get("avatar_url") as string) || undefined,
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No se encontró el usuario" };

  const updates: Record<string, unknown> = {
    full_name: parsed.data.full_name,
    phone: `${parsed.data.country_code}${parsed.data.phone}`,
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.avatar_url) {
    updates.avatar_url = parsed.data.avatar_url;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: "Error al guardar los cambios" };

  redirect("/ejercicios/perfil");
}
