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
import { getWorldByDifficulty } from "@/lib/worlds";

const createUserSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(8, "Debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número")
      .regex(
        /[^A-Za-z0-9]/,
        "Debe contener al menos un carácter especial (!@#$%&*)"
      ),
    confirm_password: z.string(),
    full_name: z.string().min(2, "El nombre es requerido"),
    role: z.enum(["patient", "admin"], {
      message: "Rol inválido",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });

export type CreateUserState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

export type CreateAccountState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

export type CreateExerciseState = {
  error?: string;
  success?: string;
  exerciseId?: string;
};

const createPatientSchema = z.object({
  username: z
    .string()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(20, "El usuario no puede tener más de 20 caracteres")
    .regex(/^[a-zA-Z0-9]+$/, "Solo se permiten letras y números"),
  full_name: z.string().min(2, "El nombre es requerido"),
});

export type CreatePatientState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
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
    confirm_password: formData.get("confirm_password") as string,
    full_name: formData.get("full_name") as string,
    role: formData.get("role") as string,
  };

  const validatedFields = createUserSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const flattened = validatedFields.error.flatten();
    return { fieldErrors: flattened.fieldErrors as Record<string, string[]> };
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
    if (authError.message.toLowerCase().includes("password")) {
      return { error: `La contraseña no cumple los requisitos: ${authError.message}` };
    }
    return { error: `Error al crear el usuario: ${authError.message}` };
  }

  if (authData.user) {
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        full_name,
        role,
        is_profile_complete: true,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      const { error: insertError } = await adminClient
        .from("profiles")
        .insert({
          id: authData.user.id,
          full_name,
          role,
          is_profile_complete: true,
        });

      if (insertError) {
        return { error: `Usuario creado pero hubo un error al configurar el perfil: ${insertError.message}` };
      }
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

  if (!profile || profile.role !== "admin") {
    return { error: "No tienes permisos para crear ejercicios" };
  }

  const validated = createExerciseSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { exercise_type_name, content, ...baseData } = validated.data;
  const worldId = getWorldByDifficulty(baseData.difficulty_level);

  const { data: inserted, error } = await supabase.from("exercises").insert({
    ...baseData,
    world_id: worldId,
    content: content as unknown as Json,
    created_by: user.id,
    is_active: true,
  }).select("id").single();

  if (error || !inserted) {
    console.error("Supabase insert error:", error);
    return { error: "Error al crear el ejercicio" };
  }

  revalidatePath("/admin/ejercicios");
  return { success: "Ejercicio creado exitosamente", exerciseId: inserted.id };
}

export async function updateExercise(
  id: string,
  data: CreateExerciseInput
): Promise<CreateExerciseState> {
  const parsed = z.string().uuid("ID de ejercicio inválido").safeParse(id);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

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

  if (!profile || profile.role !== "admin") {
    return { error: "No tienes permisos para editar ejercicios" };
  }

  const validated = createExerciseSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { exercise_type_name, content, ...baseData } = validated.data;
  const worldId = getWorldByDifficulty(baseData.difficulty_level);

  const { error } = await supabase
    .from("exercises")
    .update({
      ...baseData,
      world_id: worldId,
      content: content as unknown as Json,
    })
    .eq("id", parsed.data);

  if (error) {
    console.error("Supabase update error:", error);
    return { error: "Error al actualizar el ejercicio" };
  }

  revalidatePath("/admin/ejercicios");
  return { success: "Ejercicio actualizado exitosamente" };
}

export async function deleteExercise(id: string): Promise<{ error?: string; success?: string }> {
  const parsed = z.string().uuid("ID de ejercicio inválido").safeParse(id);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

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

  const admin = createAdminClient();

  const { error } = await admin
    .from("exercises")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", parsed.data)
    .is("deleted_at", null);

  if (error) {
    console.error("Soft delete exercise error:", error);
    return { error: "Error al eliminar el ejercicio" };
  }

  revalidatePath("/admin/ejercicios");
  return { success: "Ejercicio eliminado exitosamente" };
}

export async function restoreExercise(id: string): Promise<{ error?: string; success?: string }> {
  const parsed = z.string().uuid("ID de ejercicio inválido").safeParse(id);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

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
    return { error: "No tienes permisos para restaurar ejercicios" };
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("exercises")
    .update({ deleted_at: null })
    .eq("id", parsed.data)
    .not("deleted_at", "is", null);

  if (error) {
    console.error("Restore exercise error:", error);
    return { error: "Error al restaurar el ejercicio" };
  }

  revalidatePath("/admin/ejercicios");
  return { success: "Ejercicio restaurado exitosamente" };
}

export async function deleteUser(id: string): Promise<{ error?: string; success?: string }> {
  const parsed = z.string().uuid("ID de usuario inválido").safeParse(id);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

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

  if (parsed.data === user.id) {
    return { error: "No puedes eliminarte a ti mismo" };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(parsed.data);

  if (error) {
    return { error: "Error al eliminar el usuario" };
  }

  revalidatePath("/admin/usuarios");
  return { success: "Usuario eliminado exitosamente" };
}

export async function createPatient(
  prevState: CreatePatientState,
  formData: FormData
): Promise<CreatePatientState> {
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
    return { error: "No tienes permisos para crear pacientes" };
  }

  const rawData = {
    username: formData.get("username") as string,
    full_name: formData.get("full_name") as string,
  };

  const validatedFields = createPatientSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const flattened = validatedFields.error.flatten();
    return { fieldErrors: flattened.fieldErrors as Record<string, string[]> };
  }

  const { username, full_name } = validatedFields.data;
  const email = `${username.toLowerCase()}@basilisa.internal`;

  const adminClient = createAdminClient();
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: "Basilisa2025",
    email_confirm: true,
    user_metadata: {
      must_change_password: true,
    },
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return { error: "Este nombre de usuario ya está en uso" };
    }
    return { error: `Error al crear el paciente: ${authError.message}` };
  }

  if (authData.user) {
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        full_name,
        role: "patient",
        is_profile_complete: true,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      const { error: insertError } = await adminClient
        .from("profiles")
        .insert({
          id: authData.user.id,
          full_name,
          role: "patient",
          is_profile_complete: true,
        });

      if (insertError) {
        return { error: `Paciente creado pero hubo un error al configurar el perfil: ${insertError.message}` };
      }
    }
  }

  revalidatePath("/admin/usuarios");
  return { success: `Paciente creado. Usuario: ${username.toLowerCase()} / Contraseña: Basilisa2025` };
}

export async function resetPatientPassword(id: string): Promise<{ error?: string; success?: string }> {
  const parsed = z.string().uuid("ID de paciente inválido").safeParse(id);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

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
    return { error: "No tienes permisos para resetear contraseñas" };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(parsed.data, {
    password: "Basilisa2025",
    user_metadata: {
      must_change_password: true,
    },
  });

  if (error) {
    return { error: "Error al resetear la contraseña" };
  }

  revalidatePath("/admin/usuarios");
  return { success: "Contraseña reseteada. Nueva contraseña: Basilisa2025" };
}

export async function updateUserRole(
  userId: string,
  newRole: string
): Promise<{ error?: string; success?: string }> {
  const parsed = z.string().uuid("ID de usuario inválido").safeParse(userId);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const roleValidation = z.enum(["patient", "admin"]).safeParse(newRole);
  if (!roleValidation.success) {
    return { error: "Rol inválido" };
  }

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
    return { error: "No tienes permisos para cambiar roles" };
  }

  if (parsed.data === user.id) {
    return { error: "No puedes cambiar tu propio rol" };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("profiles")
    .update({ role: roleValidation.data })
    .eq("id", parsed.data);

  if (error) {
    return { error: "Error al actualizar el rol" };
  }

  revalidatePath("/admin/usuarios");
  return { success: `Rol actualizado a ${roleValidation.data === "admin" ? "Administrador" : "Paciente"}` };
}

export async function createAccount(
  prevState: CreateAccountState,
  formData: FormData
): Promise<CreateAccountState> {
  const accountType = formData.get("account_type") as string;

  if (accountType === "patient") {
    return createPatient(prevState, formData);
  }

  return createUser(prevState, formData);
}

const assignExerciseSchema = z.object({
  patientId: z.string().uuid("ID de paciente inválido"),
  exerciseId: z.string().uuid("ID de ejercicio inválido"),
  dueDate: z.string().nullable().optional(),
  notesForPatient: z.string().max(500).nullable().optional(),
});

export type AssignExerciseState = {
  error?: string;
  success?: string;
};

export async function assignExercise(
  data: z.infer<typeof assignExerciseSchema>
): Promise<AssignExerciseState> {
  const validated = assignExerciseSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

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

  if (!adminProfile || adminProfile.role !== "admin") {
    return { error: "No tienes permisos para asignar ejercicios" };
  }

  const { patientId, exerciseId, dueDate, notesForPatient } = validated.data;

  const adminClient = createAdminClient();

  const { data: patientProfile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", patientId)
    .single();

  if (!patientProfile || patientProfile.role !== "patient") {
    return { error: "El usuario no es un paciente válido" };
  }

  const { data: existingAssignment } = await adminClient
    .from("patient_assignments")
    .select("id")
    .eq("patient_id", patientId)
    .eq("exercise_id", exerciseId)
    .in("status", ["assigned", "in_progress"])
    .maybeSingle();

  if (existingAssignment) {
    return { error: "Este ejercicio ya está asignado al paciente" };
  }

  const { error } = await adminClient.from("patient_assignments").insert({
    patient_id: patientId,
    exercise_id: exerciseId,
    assigned_by: user.id,
    status: "assigned",
    due_date: dueDate || null,
    notes_for_patient: notesForPatient || null,
  });

  if (error) {
    console.error("Assign exercise error:", error);
    return { error: "Error al asignar el ejercicio" };
  }

  revalidatePath(`/admin/pacientes/${patientId}`);
  return { success: "Ejercicio asignado exitosamente" };
}

export async function cancelAssignment(
  assignmentId: string,
  patientId: string
): Promise<{ error?: string; success?: string }> {
  const parsedId = z.string().uuid("ID de asignación inválido").safeParse(assignmentId);
  if (!parsedId.success) {
    return { error: parsedId.error.issues[0].message };
  }

  const parsedPatientId = z.string().uuid("ID de paciente inválido").safeParse(patientId);
  if (!parsedPatientId.success) {
    return { error: parsedPatientId.error.issues[0].message };
  }

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

  if (!adminProfile || adminProfile.role !== "admin") {
    return { error: "No tienes permisos para desasignar ejercicios" };
  }

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("patient_assignments")
    .update({ status: "cancelled" })
    .eq("id", parsedId.data)
    .in("status", ["assigned", "in_progress", "pending"]);

  if (error) {
    console.error("Cancel assignment error:", error);
    return { error: "Error al desasignar el ejercicio" };
  }

  revalidatePath(`/admin/pacientes/${parsedPatientId.data}`);
  return { success: "Ejercicio desasignado exitosamente" };
}
