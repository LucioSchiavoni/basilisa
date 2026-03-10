"use client";

import { useState } from "react";
import { deleteUser, resetPatientPassword, updateUserRole } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type User = {
  id: string;
  full_name: string | null;
  email: string;
  role: string | null;
  is_profile_complete: boolean | null;
  needs_grade_review: boolean | null;
  grade_year: number | null;
  created_at: string | null;
  is_patient: boolean;
  username: string | null;
  must_change_password: boolean;
};

const roleLabels: Record<string, string> = {
  patient: "Paciente",
  admin: "Administrador",
};

export function UsersList({
  users,
  currentUserId,
}: {
  users: User[];
  currentUserId: string;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [resetting, setResetting] = useState<string | null>(null);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [roleSuccess, setRoleSuccess] = useState<string | null>(null);

  async function handleRoleChange(userId: string, newRole: string) {
    setChangingRole(userId);
    setRoleSuccess(null);
    const result = await updateUserRole(userId, newRole);
    setChangingRole(null);

    if (result.error) {
      alert(result.error);
    } else {
      setRoleSuccess(userId);
      setTimeout(() => setRoleSuccess(null), 2000);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      return;
    }

    setDeleting(id);
    const result = await deleteUser(id);
    setDeleting(null);

    if (result.error) {
      alert(result.error);
    }
  }

  async function handleReset(id: string) {
    if (!confirm("¿Resetear la contraseña a la contraseña por defecto?")) {
      return;
    }

    setResetting(id);
    const result = await resetPatientPassword(id);
    setResetting(null);

    if (result.error) {
      alert(result.error);
    }
  }

  if (users.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No hay usuarios registrados
      </p>
    );
  }

  return (
    <div className="divide-y">
      {users.map((user) => (
        <div key={user.id} className="py-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              <p className="font-medium truncate">{user.full_name || "Sin nombre"}</p>
              <p className="text-sm text-muted-foreground truncate">
                {user.is_patient ? `@${user.username}` : user.email}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {user.is_patient && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReset(user.id)}
                  disabled={resetting === user.id}
                  className="text-xs"
                >
                  {resetting === user.id ? "..." : "Resetear"}
                </Button>
              )}
              {user.id !== currentUserId && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                  disabled={deleting === user.id}
                  className="text-xs"
                >
                  {deleting === user.id ? "..." : "Eliminar"}
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {user.id === currentUserId ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                {roleLabels[user.role || "patient"] || user.role} (tú)
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <Select
                  defaultValue={user.role || "patient"}
                  onValueChange={(value) => handleRoleChange(user.id, value)}
                  disabled={changingRole === user.id}
                >
                  <SelectTrigger className="h-7 text-xs w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Paciente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                {changingRole === user.id && (
                  <span className="text-xs text-muted-foreground">Guardando...</span>
                )}
                {roleSuccess === user.id && (
                  <span className="text-xs text-green-600 dark:text-green-400">✓ Guardado</span>
                )}
              </div>
            )}
            {user.is_patient && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Sin correo
              </span>
            )}
            {!user.is_profile_complete && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                Perfil incompleto
              </span>
            )}
            {user.must_change_password && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                Cambio de contraseña pendiente
              </span>
            )}
            {user.needs_grade_review && user.role === "patient" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                Revisar grado ({user.grade_year}°)
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
