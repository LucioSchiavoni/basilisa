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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { KeyRound, Trash2, Loader2 } from "lucide-react";

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

type PendingRole = { userId: string; newRole: string; userName: string };
type PendingReset = { userId: string; userName: string };
type PendingDelete = { userId: string; userName: string };

function UserInitials({ name }: { name: string | null }) {
  const initials = (name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
      {initials}
    </div>
  );
}

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

  const [displayRoles, setDisplayRoles] = useState<Record<string, string>>(() =>
    Object.fromEntries(users.map((u) => [u.id, u.role || "patient"]))
  );
  const [pendingRole, setPendingRole] = useState<PendingRole | null>(null);
  const [pendingReset, setPendingReset] = useState<PendingReset | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  async function confirmRoleChange() {
    if (!pendingRole) return;
    setChangingRole(pendingRole.userId);
    const result = await updateUserRole(pendingRole.userId, pendingRole.newRole);
    setChangingRole(null);
    if (result.error) {
      alert(result.error);
    } else {
      setDisplayRoles((prev) => ({ ...prev, [pendingRole.userId]: pendingRole.newRole }));
      setRoleSuccess(pendingRole.userId);
      setTimeout(() => setRoleSuccess(null), 2000);
    }
    setPendingRole(null);
  }

  async function confirmReset() {
    if (!pendingReset) return;
    setResetting(pendingReset.userId);
    const result = await resetPatientPassword(pendingReset.userId);
    setResetting(null);
    if (result.error) alert(result.error);
    setPendingReset(null);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(pendingDelete.userId);
    const result = await deleteUser(pendingDelete.userId);
    setDeleting(null);
    if (result.error) alert(result.error);
    setPendingDelete(null);
  }

  if (users.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No hay usuarios registrados
      </p>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground sm:px-4">Usuario</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground hidden sm:table-cell w-40">Rol</th>
              <th className="px-2 py-2.5 w-16 sm:w-20 sm:px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => {
              const displayRole = displayRoles[user.id] || user.role || "patient";
              const userName = user.full_name || (user.username ? `@${user.username}` : user.email);

              return (
                <tr key={user.id} className="bg-card hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2.5 sm:px-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <UserInitials name={user.full_name} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate leading-tight text-[13px]">
                          {user.full_name || "Sin nombre"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {user.is_patient ? `@${user.username}` : user.email}
                        </p>

                        <div className="sm:hidden mt-1.5">
                          {user.id === currentUserId ? (
                            <span className="text-xs px-1.5 py-0 rounded-full border">
                              {roleLabels[displayRole] || displayRole} (tú)
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <Select
                                value={displayRole}
                                onValueChange={(value) =>
                                  setPendingRole({ userId: user.id, newRole: value, userName })
                                }
                                disabled={changingRole === user.id}
                              >
                                <SelectTrigger className="h-6 text-xs w-[108px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="patient">Paciente</SelectItem>
                                  <SelectItem value="admin">Administrador</SelectItem>
                                </SelectContent>
                              </Select>
                              {changingRole === user.id && (
                                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                              )}
                              {roleSuccess === user.id && (
                                <span className="text-xs text-green-600 dark:text-green-400">✓</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {user.is_patient && (
                            <span className="text-[10px] leading-none px-1.5 py-[3px] rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 whitespace-nowrap">
                              Sin correo
                            </span>
                          )}
                          {!user.is_profile_complete && (
                            <span className="text-[10px] leading-none px-1.5 py-[3px] rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 whitespace-nowrap">
                              Perfil incompleto
                            </span>
                          )}
                          {user.must_change_password && (
                            <span className="text-[10px] leading-none px-1.5 py-[3px] rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 whitespace-nowrap">
                              Cambiar contraseña
                            </span>
                          )}
                          {user.needs_grade_review && user.role === "patient" && (
                            <span className="text-[10px] leading-none px-1.5 py-[3px] rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 whitespace-nowrap">
                              Revisar grado ({user.grade_year}°)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-2.5 hidden sm:table-cell">
                    {user.id === currentUserId ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        {roleLabels[displayRole] || displayRole} (tú)
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Select
                          value={displayRole}
                          onValueChange={(value) =>
                            setPendingRole({ userId: user.id, newRole: value, userName })
                          }
                          disabled={changingRole === user.id}
                        >
                          <SelectTrigger className="h-7 text-xs w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="patient">Paciente</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                        {changingRole === user.id && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                        )}
                        {roleSuccess === user.id && (
                          <span className="text-xs text-green-600 dark:text-green-400">✓</span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="pl-2 pr-0 py-2.5 sm:px-4">
                    <div className="flex gap-1 justify-end mr-3 sm:mr-0">
                      {user.is_patient && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          disabled={resetting === user.id}
                          title="Resetear contraseña"
                          onClick={() => setPendingReset({ userId: user.id, userName })}
                        >
                          {resetting === user.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <KeyRound className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                      {user.id !== currentUserId && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7"
                          disabled={deleting === user.id}
                          title="Eliminar usuario"
                          onClick={() => setPendingDelete({ userId: user.id, userName })}
                        >
                          {deleting === user.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!pendingRole} onOpenChange={(open) => !open && setPendingRole(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar rol</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a cambiar el rol de{" "}
              <span className="font-semibold text-foreground">{pendingRole?.userName}</span>{" "}
              a{" "}
              <span className="font-semibold text-foreground">
                {roleLabels[pendingRole?.newRole ?? ""] ?? pendingRole?.newRole}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange} className="w-full sm:w-auto">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!pendingReset} onOpenChange={(open) => !open && setPendingReset(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Resetear contraseña</AlertDialogTitle>
            <AlertDialogDescription>
              La contraseña de{" "}
              <span className="font-semibold text-foreground">{pendingReset?.userName}</span>{" "}
              se va a resetear a{" "}
              <span className="font-mono font-semibold text-foreground">Basilisa2025</span>. El
              usuario deberá cambiarla al iniciar sesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset} className="w-full sm:w-auto">
              Resetear contraseña
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar a{" "}
              <span className="font-semibold text-foreground">{pendingDelete?.userName}</span>.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
