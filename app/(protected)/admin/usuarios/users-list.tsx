"use client";

import { useState } from "react";
import { deleteUser, resetPatientPassword, updateUserPlan, updateUserRole } from "../actions";
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
import { KeyRound, Loader2, Trash2 } from "lucide-react";

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
  plan: {
    id: string;
    code: string;
    name: string;
  } | null;
};

type Plan = {
  id: string;
  code: string;
  name: string;
};

type PendingRole = { userId: string; newRole: string; userName: string };
type PendingPlan = { userId: string; newPlanId: string; userName: string; planName: string };
type PendingReset = { userId: string; userName: string };
type PendingDelete = { userId: string; userName: string };

function UserInitials({ name }: { name: string | null }) {
  const initials = (name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
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
  plans,
}: {
  users: User[];
  currentUserId: string;
  plans: Plan[];
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [resetting, setResetting] = useState<string | null>(null);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [roleSuccess, setRoleSuccess] = useState<string | null>(null);
  const [planSuccess, setPlanSuccess] = useState<string | null>(null);

  const [displayRoles, setDisplayRoles] = useState<Record<string, string>>(() =>
    Object.fromEntries(users.map((user) => [user.id, user.role || "patient"]))
  );
  const [displayPlans, setDisplayPlans] = useState<Record<string, string>>(() =>
    Object.fromEntries(users.map((user) => [user.id, user.plan?.id || plans[0]?.id || ""]))
  );

  const [pendingRole, setPendingRole] = useState<PendingRole | null>(null);
  const [pendingPlan, setPendingPlan] = useState<PendingPlan | null>(null);
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

  async function confirmPlanChange() {
    if (!pendingPlan) return;
    setChangingPlan(pendingPlan.userId);
    const result = await updateUserPlan(pendingPlan.userId, pendingPlan.newPlanId);
    setChangingPlan(null);

    if (result.error) {
      alert(result.error);
    } else {
      setDisplayPlans((prev) => ({ ...prev, [pendingPlan.userId]: pendingPlan.newPlanId }));
      setPlanSuccess(pendingPlan.userId);
      setTimeout(() => setPlanSuccess(null), 2000);
    }

    setPendingPlan(null);
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
    return <p className="py-8 text-center text-muted-foreground">No hay usuarios registrados</p>;
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground sm:px-4">Usuario</th>
              <th className="hidden w-40 px-3 py-2.5 text-left font-medium text-muted-foreground sm:table-cell">Plan</th>
              <th className="hidden w-40 px-3 py-2.5 text-left font-medium text-muted-foreground sm:table-cell">Rol</th>
              <th className="w-16 px-2 py-2.5 sm:w-20 sm:px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => {
              const displayRole = displayRoles[user.id] || user.role || "patient";
              const displayPlanId = displayPlans[user.id] || user.plan?.id || plans[0]?.id || "";
              const isAdminUser = displayRole === "admin";
              const userName = user.full_name || (user.username ? `@${user.username}` : user.email);

              return (
                <tr key={user.id} className="bg-card transition-colors hover:bg-muted/20">
                  <td className="px-3 py-2.5 sm:px-4">
                    <div className="flex min-w-0 items-center gap-2">
                      <UserInitials name={user.full_name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium leading-tight">
                          {user.full_name || "Sin nombre"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {user.is_patient ? `@${user.username}` : user.email}
                        </p>

                        <div className="mt-1.5 sm:hidden">
                          {user.id === currentUserId ? (
                            <div className="flex flex-wrap gap-1.5">
                              <span className="rounded-full border px-1.5 py-0 text-xs">
                                {isAdminUser ? "Administrador" : (user.plan?.name ?? plans[0]?.name ?? "Sin plan")} (tú)
                              </span>
                              <span className="rounded-full border px-1.5 py-0 text-xs">
                                {roleLabels[displayRole] || displayRole} (tú)
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isAdminUser ? (
                                <span className="rounded-full bg-sky-100 px-2 py-1 text-[11px] text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                                  Administrador
                                </span>
                              ) : (
                                <Select
                                  value={displayPlanId}
                                  onValueChange={(value) => {
                                    const selectedPlan = plans.find((plan) => plan.id === value);
                                    if (!selectedPlan) return;
                                    setPendingPlan({
                                      userId: user.id,
                                      newPlanId: value,
                                      userName,
                                      planName: selectedPlan.name,
                                    });
                                  }}
                                  disabled={changingPlan === user.id || plans.length === 0}
                                >
                                  <SelectTrigger className="h-6 w-[108px] text-xs">
                                    <SelectValue placeholder="Plan" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {plans.map((plan) => (
                                      <SelectItem key={plan.id} value={plan.id}>
                                        {plan.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}

                              <Select
                                value={displayRole}
                                onValueChange={(value) =>
                                  setPendingRole({ userId: user.id, newRole: value, userName })
                                }
                                disabled={changingRole === user.id}
                              >
                                <SelectTrigger className="h-6 w-[108px] text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="patient">Paciente</SelectItem>
                                  <SelectItem value="admin">Administrador</SelectItem>
                                </SelectContent>
                              </Select>

                              {!isAdminUser && changingPlan === user.id && (
                                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                              )}
                              {changingRole === user.id && (
                                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                              )}
                              {!isAdminUser && planSuccess === user.id && (
                                <span className="text-xs text-green-600 dark:text-green-400">✓</span>
                              )}
                              {roleSuccess === user.id && (
                                <span className="text-xs text-green-600 dark:text-green-400">✓</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {user.is_patient && (
                            <span className="whitespace-nowrap rounded-full bg-blue-100 px-1.5 py-[3px] text-[10px] leading-none text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              Sin correo
                            </span>
                          )}
                          {!user.is_profile_complete && (
                            <span className="whitespace-nowrap rounded-full bg-yellow-100 px-1.5 py-[3px] text-[10px] leading-none text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                              Perfil incompleto
                            </span>
                          )}
                          {user.must_change_password && (
                            <span className="whitespace-nowrap rounded-full bg-orange-100 px-1.5 py-[3px] text-[10px] leading-none text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                              Cambiar contraseña
                            </span>
                          )}
                          {user.needs_grade_review && user.role === "patient" && (
                            <span className="whitespace-nowrap rounded-full bg-teal-100 px-1.5 py-[3px] text-[10px] leading-none text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                              Revisar grado ({user.grade_year}°)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="hidden px-4 py-2.5 sm:table-cell">
                    {user.id === currentUserId ? (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                        {isAdminUser ? "Administrador" : (user.plan?.name ?? plans[0]?.name ?? "Sin plan")} (tú)
                      </span>
                    ) : isAdminUser ? (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                        Administrador
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Select
                          value={displayPlanId}
                          onValueChange={(value) => {
                            const selectedPlan = plans.find((plan) => plan.id === value);
                            if (!selectedPlan) return;
                            setPendingPlan({
                              userId: user.id,
                              newPlanId: value,
                              userName,
                              planName: selectedPlan.name,
                            });
                          }}
                          disabled={changingPlan === user.id || plans.length === 0}
                        >
                          <SelectTrigger className="h-7 w-[120px] text-xs">
                            <SelectValue placeholder="Plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {plans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {changingPlan === user.id && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                        )}
                        {planSuccess === user.id && (
                          <span className="text-xs text-green-600 dark:text-green-400">✓</span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="hidden px-4 py-2.5 sm:table-cell">
                    {user.id === currentUserId ? (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
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
                          <SelectTrigger className="h-7 w-[120px] text-xs">
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

                  <td className="py-2.5 pl-2 pr-0 sm:px-4">
                    <div className="mr-3 flex justify-end gap-1 sm:mr-0">
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

      <AlertDialog open={!!pendingPlan} onOpenChange={(open) => !open && setPendingPlan(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar plan</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a cambiar el plan de{" "}
              <span className="font-semibold text-foreground">{pendingPlan?.userName}</span>{" "}
              a{" "}
              <span className="font-semibold text-foreground">{pendingPlan?.planName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPlanChange} className="w-full sm:w-auto">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!pendingRole} onOpenChange={(open) => !open && setPendingRole(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl sm:max-w-md">
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
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange} className="w-full sm:w-auto">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!pendingReset} onOpenChange={(open) => !open && setPendingReset(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl sm:max-w-md">
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
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset} className="w-full sm:w-auto">
              Resetear contraseña
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar a{" "}
              <span className="font-semibold text-foreground">{pendingDelete?.userName}</span>.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
