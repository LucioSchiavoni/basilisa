"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  full_name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s._-]+$/, "El nombre contiene caracteres no permitidos"),
  country_code: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^\d+$/.test(v), { message: "El teléfono solo puede contener números" })
    .refine((v) => !v || v.length >= 8, { message: "El teléfono debe tener al menos 8 dígitos" }),
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
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.phone) {
    updates.phone = `${parsed.data.country_code ?? "+598"}${parsed.data.phone}`;
  }

  if (parsed.data.avatar_url) {
    updates.avatar_url = parsed.data.avatar_url;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: "Error al guardar los cambios" };

  redirect("/perfil");
}
