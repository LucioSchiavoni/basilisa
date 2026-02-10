import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { AdminBottomNav } from "@/components/admin-bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/ejercicios");
  }

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-card border-r">
        <div className="p-6">
          <h2 className="text-xl font-bold">Panel Admin</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {profile?.full_name || user.email}
          </p>
        </div>
        <nav className="px-4 space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            Dashboard
          </Link>
          <Link
            href="/admin/ejercicios"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <line x1="10" x2="8" y1="9" y2="9" />
            </svg>
            Ejercicios
          </Link>
          <Link
            href="/admin/pacientes"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3v16a2 2 0 0 0 2 2h16" />
              <path d="m7 11 4-4 4 4 5-5" />
            </svg>
            Seguimiento
          </Link>
          <Link
            href="/admin/usuarios"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Usuarios
          </Link>
        </nav>
        <div className="mt-auto p-4 border-t space-y-3">
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
          <form action={logout}>
            <Button variant="outline" type="submit" className="w-full">
              Cerrar Sesión
            </Button>
          </form>
        </div>
      </aside>
      <div className="flex-1 flex flex-col lg:hidden">
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div>
            <h2 className="text-lg font-bold">Panel Admin</h2>
            <p className="text-xs text-muted-foreground">
              {profile?.full_name || user.email}
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>
      <main className="flex-1 p-4 pb-20 lg:p-8 lg:pb-8">
        {children}
      </main>
      <AdminBottomNav />
    </div>
  );
}
