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
import { getWorldByDifficulty } from "@/lib/worlds"
import { analyzeText } from "@/lib/services/idl"

async function computeIdlScore(content: CreateExerciseInput["content"]): Promise<number | null> {
  const text = "reading_text" in content && typeof content.reading_text === "string" && content.reading_text.trim()
    ? content.reading_text
    : null
  if (!text) return null
  try {
    const result = await analyzeText(text)
    return result.score
  } catch {
    return null
  }
};


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
    grade_year: z.coerce.number().int().min(1).max(6).optional(),
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
  grade_year: z.coerce.number().int().min(1).max(6).optional(),
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
    grade_year: formData.get("grade_year") || undefined,
  };

  const validatedFields = createUserSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const flattened = validatedFields.error.flatten();
    return { fieldErrors: flattened.fieldErrors as Record<string, string[]> };
  }

  const { email, password, full_name, role, grade_year } = validatedFields.data;

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
      return { error: "La contraseña no cumple los requisitos mínimos de seguridad" };
    }
    return { error: "Error al crear el usuario. Intentá de nuevo." };
  }

  if (authData.user) {
    const profileData = {
      full_name,
      role,
      is_profile_complete: true,
      ...(role === "patient" && grade_year != null && {
        grade_year,
        grade_year_updated_at: new Date().toISOString(),
      }),
    };

    const { error: profileError } = await adminClient
      .from("profiles")
      .update(profileData)
      .eq("id", authData.user.id);

    if (profileError) {
      const { error: insertError } = await adminClient
        .from("profiles")
        .insert({ id: authData.user.id, email, ...profileData });

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
  const worldSlug = getWorldByDifficulty(baseData.difficulty_level);
  const idlScore = await computeIdlScore(content);

  const adminClient = createAdminClient();

  const { data: inserted, error } = await adminClient.from("exercises").insert({
    ...baseData,
    world_id: worldSlug,
    content: content as unknown as Json,
    idl_score: idlScore,
    created_by: user.id,
    is_active: true,
  }).select("id").single();

  if (error || !inserted) {
    console.error("Supabase insert error:", error);
    return { error: "Error al crear el ejercicio" };
  }

  if (worldSlug) {
    const { data: world } = await adminClient
      .from("worlds")
      .select("id")
      .eq("name", worldSlug)
      .single();

    if (world) {
      const { data: lastPos } = await adminClient
        .from("world_exercises")
        .select("position")
        .eq("world_id", world.id)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();

      await adminClient.from("world_exercises").insert({
        world_id: world.id,
        exercise_id: inserted.id,
        position: (lastPos?.position ?? 0) + 1,
      });
    }
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
  const worldSlug = getWorldByDifficulty(baseData.difficulty_level);
  const idlScore = await computeIdlScore(content);

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("exercises")
    .update({
      ...baseData,
      world_id: worldSlug,
      content: content as unknown as Json,
      idl_score: idlScore,
    })
    .eq("id", parsed.data);

  if (error) {
    console.error("Supabase update error:", error);
    return { error: "Error al actualizar el ejercicio" };
  }

  if (worldSlug) {
    const { data: world } = await adminClient
      .from("worlds")
      .select("id")
      .eq("name", worldSlug)
      .single();

    if (world) {
      const { data: existing } = await adminClient
        .from("world_exercises")
        .select("id, world_id")
        .eq("exercise_id", parsed.data)
        .maybeSingle();

      if (!existing) {
        const { data: lastPos } = await adminClient
          .from("world_exercises")
          .select("position")
          .eq("world_id", world.id)
          .order("position", { ascending: false })
          .limit(1)
          .maybeSingle();

        await adminClient.from("world_exercises").insert({
          world_id: world.id,
          exercise_id: parsed.data,
          position: (lastPos?.position ?? 0) + 1,
        });
      } else if (existing.world_id !== world.id) {
        await adminClient
          .from("world_exercises")
          .update({ world_id: world.id })
          .eq("id", existing.id);
      }
    }
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
    grade_year: formData.get("grade_year") || undefined,
  };

  const validatedFields = createPatientSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const flattened = validatedFields.error.flatten();
    return { fieldErrors: flattened.fieldErrors as Record<string, string[]> };
  }

  const { username, full_name, grade_year } = validatedFields.data;
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
    return { error: "Error al crear el paciente. Intentá de nuevo." };
  }

  if (authData.user) {
    const profileData = {
      full_name,
      role: "patient",
      is_profile_complete: true,
      must_change_password: true,
      ...(grade_year != null && { grade_year, grade_year_updated_at: new Date().toISOString() }),
    };

    const { error: profileError } = await adminClient
      .from("profiles")
      .update(profileData)
      .eq("id", authData.user.id);

    if (profileError) {
      const { error: insertError } = await adminClient
        .from("profiles")
        .insert({
          id: authData.user.id,
          email,
          ...profileData,
        });

      if (insertError) {
        return { error: "Paciente creado pero hubo un error al configurar el perfil." };
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

export async function getExercisesForAssignment() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("exercises")
    .select("id, title, difficulty_level, exercise_types(display_name)")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("title");

  return (data ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    difficultyLevel: e.difficulty_level,
    exerciseTypeDisplayName:
      e.exercise_types && !Array.isArray(e.exercise_types)
        ? e.exercise_types.display_name
        : "Sin tipo",
  }));
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

const assignExercisesBulkSchema = z.object({
  patientId: z.string().uuid("ID de paciente inválido"),
  assignments: z.array(z.object({
    exerciseId: z.string().uuid(),
    startDate: z.string().nullable().optional(),
    dueDate: z.string().nullable().optional(),
  })).min(1, "Selecciona al menos un ejercicio"),
});

export async function assignExercisesBulk(
  data: z.infer<typeof assignExercisesBulkSchema>
): Promise<{ error?: string; assigned?: number; skipped?: number }> {
  const validated = assignExercisesBulkSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!adminProfile || adminProfile.role !== "admin") {
    return { error: "No tienes permisos para asignar ejercicios" };
  }

  const { patientId, assignments } = validated.data;
  const adminClient = createAdminClient();

  const { data: patientProfile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", patientId)
    .single();

  if (!patientProfile || patientProfile.role !== "patient") {
    return { error: "El usuario seleccionado no es un paciente válido" };
  }

  const exerciseIds = assignments.map((a) => a.exerciseId);

  const { data: existing } = await adminClient
    .from("patient_assignments")
    .select("exercise_id")
    .eq("patient_id", patientId)
    .in("exercise_id", exerciseIds)
    .in("status", ["assigned", "in_progress"]);

  const existingIds = new Set((existing ?? []).map((e) => e.exercise_id));
  const toInsert = assignments.filter((a) => !existingIds.has(a.exerciseId));

  if (toInsert.length === 0) {
    return { error: "Todos los ejercicios seleccionados ya están asignados a este paciente" };
  }

  const { error } = await adminClient.from("patient_assignments").insert(
    toInsert.map((a) => ({
      patient_id: patientId,
      exercise_id: a.exerciseId,
      assigned_by: user.id,
      status: "assigned",
      assigned_at: a.startDate ? new Date(a.startDate).toISOString() : new Date().toISOString(),
      due_date: a.dueDate || null,
    }))
  );

  if (error) {
    return { error: "Error al asignar los ejercicios" };
  }

  revalidatePath(`/admin/pacientes/${patientId}`);
  revalidatePath("/admin");
  return { assigned: toInsert.length, skipped: existingIds.size };
}
