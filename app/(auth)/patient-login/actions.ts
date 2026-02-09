"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const patientLoginSchema = z.object({
  username: z
    .string()
    .min(1, "Ingresa tu nombre de usuario")
    .regex(/^[a-zA-Z0-9]+$/, "Solo letras y números"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export type PatientLoginState = {
  error?: string;
};

export async function patientLogin(
  _prevState: PatientLoginState,
  formData: FormData
): Promise<PatientLoginState> {
  const rawData = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  const parsed = patientLoginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const email = `${parsed.data.username.toLowerCase()}@basilisa.internal`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Usuario o contraseña incorrectos" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No se pudo obtener el usuario" };
  }

  if (user.user_metadata?.must_change_password === true) {
    redirect("/change-password");
  }

  redirect("/ejercicios");
}
