"use client";

import { useState } from "react";
import { deleteUser, resetPatientPassword } from "../actions";
import { Button } from "@/components/ui/button";

type User = {
  id: string;
  full_name: string | null;
  email: string;
  role: string | null;
  is_profile_complete: boolean | null;
  created_at: string | null;
  is_patient: boolean;
  username: string | null;
  must_change_password: boolean;
};

const roleLabels: Record<string, string> = {
  patient: "Paciente",
  admin: "Administrador",
};

export function UsersList({ users }: { users: User[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [resetting, setResetting] = useState<string | null>(null);

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
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="space-y-1">
            <p className="font-medium">{user.full_name || "Sin nombre"}</p>
            <p className="text-sm text-muted-foreground">
              {user.is_patient ? `@${user.username}` : user.email}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  user.role === "admin"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                }`}
              >
                {roleLabels[user.role || "patient"] || user.role}
              </span>
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
                  Pendiente cambio de contraseña
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {user.is_patient && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReset(user.id)}
                disabled={resetting === user.id}
              >
                {resetting === user.id ? "Reseteando..." : "Resetear contraseña"}
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(user.id)}
              disabled={deleting === user.id}
            >
              {deleting === user.id ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
