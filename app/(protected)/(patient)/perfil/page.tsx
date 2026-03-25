import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Mail, Phone, Calendar, Flame, LogOut, KeyRound } from "lucide-react";
import { GemIcon } from "@/components/gem-icon";
import { logout } from "@/app/(auth)/actions";

function formatDate(dateString: string | null): string {
  if (!dateString) return "No especificado";
  return new Date(dateString).toLocaleDateString("es-UY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPhone(phone: string | null): string {
  if (!phone) return "No especificado";
  if (phone.startsWith("+598")) {
    return `+598 ${phone.substring(4)}`;
  }
  return phone;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }
  return email[0].toUpperCase();
}

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: gems }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email, date_of_birth, phone, avatar_url, is_profile_complete, created_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("user_gems")
      .select("total_gems, current_streak, best_streak, last_activity_date")
      .eq("user_id", user.id)
      .single(),
  ]);

  const providers = (user.app_metadata?.providers as string[] | undefined) ?? [];
  const hasPasswordSet = providers.includes("email");
  const initials = getInitials(profile?.full_name ?? null, user.email ?? "?");
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("es-UY", { year: "numeric", month: "long" })
    : null;

  return (
    <div className="space-y-6 max-w-xl mx-auto">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi perfil</h1>
          {memberSince && (
            <p className="text-sm text-muted-foreground mt-0.5">Miembro desde {memberSince}</p>
          )}
        </div>
        <Link
          href="/editar-perfil"
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </Link>
      </div>

      <div className="flex flex-col items-center gap-4 py-6 rounded-2xl border border-border bg-card shadow-sm">
        {profile?.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.full_name ?? "Avatar"}
            width={96}
            height={96}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-border"
          />
        ) : (
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white ring-4 ring-border"
            style={{ background: "linear-gradient(135deg, #2E85C8 0%, #579F93 100%)" }}
          >
            {initials}
          </div>
        )}
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">
            {profile?.full_name ?? "Sin nombre"}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{user.email ?? "Sin correo"}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-2 shadow-sm">
          <GemIcon size={48} />
          <span className="text-xl font-bold text-foreground">{gems?.total_gems ?? 0}</span>
          <span className="text-[11px] text-muted-foreground">Gemas</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-2 shadow-sm">
          <Flame className="h-5 w-5 text-[#D3A021]" />
          <span className="text-xl font-bold text-foreground">{gems?.current_streak ?? 0}</span>
          <span className="text-[11px] text-muted-foreground">Racha actual</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-2 shadow-sm">
          <Flame className="h-5 w-5 text-[#C73341]" />
          <span className="text-xl font-bold text-foreground">{gems?.best_streak ?? 0}</span>
          <span className="text-[11px] text-muted-foreground">Mejor racha</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Datos personales</p>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Correo electrónico</p>
              <p className="text-sm font-semibold text-foreground truncate">{user.email ?? "Sin correo"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Fecha de nacimiento</p>
              <p className="text-sm font-semibold text-foreground">{formatDate(profile?.date_of_birth ?? null)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p className="text-sm font-semibold text-foreground">{formatPhone(profile?.phone ?? null)}</p>
            </div>
          </div>
        </div>
      </div>

      <Link
        href={hasPasswordSet ? "/change-password" : "/change-password?set=1"}
        className="flex items-center justify-center gap-2 w-full rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
      >
        <KeyRound className="h-4 w-4" />
        {hasPasswordSet ? "Cambiar contraseña" : "Agregar contraseña"}
      </Link>

      <form action={logout}>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 w-full rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
