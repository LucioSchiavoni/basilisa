"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z
  .object({
    isSettingNew: z.string().optional(),
    currentPassword: z.string().optional(),
    password: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => data.isSettingNew === "1" || (data.currentPassword ?? "").length > 0,
    { message: "Ingresa tu contraseña actual", path: ["currentPassword"] }
  );

export type ChangePasswordState = {
  error?: string;
  success?: boolean;
};

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const rawData = {
    isSettingNew: formData.get("isSettingNew") as string | null,
    currentPassword: formData.get("currentPassword") as string | null,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = schema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return { error: "No se pudo obtener el usuario" };
  }

  if (parsed.data.isSettingNew !== "1") {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.currentPassword!,
    });
    if (signInError) {
      return { error: "La contraseña actual es incorrecta" };
    }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
    data: { must_change_password: false },
  });

  if (error) {
    return { error: "Error al actualizar la contraseña. Intentá de nuevo." };
  }

  return { success: true };
}
