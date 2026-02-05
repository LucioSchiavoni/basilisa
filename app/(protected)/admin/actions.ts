"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createExerciseSchema,
  type CreateExerciseInput,
} from "@/lib/schemas/exercise";
import type { Json } from "@/types/database.types";

const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  full_name: z.string().min(2, "El nombre es requerido"),
  role: z.enum(["patient", "admin", "expert"], {
    message: "Rol inválido",
  }),
});

export type CreateUserState = {
  error?: string;
  success?: string;
};

export type CreateExerciseState = {
  error?: string;
  success?: string;
};

export async function createUser(
  prevState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (!currentUser) {
    return { error: "No autorizado" };
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (adminProfile?.role !== "admin") {
    return { error: "No tienes permisos para crear usuarios" };
  }

  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    full_name: formData.get("full_name") as string,
    role: formData.get("role") as string,
  };

  const validatedFields = createUserSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { email, password, full_name, role } = validatedFields.data;

  const adminClient = createAdminClient();
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return { error: "Este email ya está registrado" };
    }
    return { error: "Error al crear el usuario" };
  }

  if (authData.user) {
    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert({
        id: authData.user.id,
        full_name,
        role,
        is_profile_complete: true,
      });

    if (profileError) {
      return { error: "Usuario creado pero hubo un error al actualizar el perfil" };
    }
  }

  revalidatePath("/admin/usuarios");
  return { success: "Usuario creado exitosamente" };
}

export async function createExercise(
  data: CreateExerciseInput
): Promise<CreateExerciseState> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "No autorizado" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "expert")) {
    return { error: "No tienes permisos para crear ejercicios" };
  }

  const validated = createExerciseSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { exercise_type_name, content, ...baseData } = validated.data;

  const { error } = await supabase.from("exercises").insert({
    ...baseData,
    content: content as unknown as Json,
    created_by: user.id,
    is_active: true,
  });

  if (error) {
    return { error: `Error al crear el ejercicio: ${error.message}` };
  }

  revalidatePath("/admin/ejercicios");
  return { success: "Ejercicio creado exitosamente" };
}

export async function deleteExercise(id: string): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "No autorizado" };
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") {
    return { error: "No tienes permisos para eliminar ejercicios" };
  }

  const { error } = await supabase.from("exercises").delete().eq("id", id);

  if (error) {
    return { error: "Error al eliminar el ejercicio" };
  }

  revalidatePath("/admin/ejercicios");
  return { success: "Ejercicio eliminado exitosamente" };
}

export async function deleteUser(id: string): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "No autorizado" };
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") {
    return { error: "No tienes permisos para eliminar usuarios" };
  }

  if (id === user.id) {
    return { error: "No puedes eliminarte a ti mismo" };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(id);

  if (error) {
    return { error: "Error al eliminar el usuario" };
  }

  revalidatePath("/admin/usuarios");
  return { success: "Usuario eliminado exitosamente" };
}
