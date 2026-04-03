"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { AdminBottomNav } from "@/components/admin-bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface AdminLayoutContentProps {
  children: React.ReactNode;
  profile: {
    full_name?: string | null;
  } | null;
  user: {
    email?: string | null;
  } | null;
}

export function AdminLayoutContent({ children, profile, user }: AdminLayoutContentProps) {
  const pathname = usePathname();
  const isPatientDetailPage = pathname.match(/^\/admin\/pacientes\/[a-zA-Z0-9-]+$/);

  return (
    <div className="admin-layout min-h-screen lg:flex bg-background">
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:w-64 bg-card border-r">
        <div className="p-6">
          <p className="text-base font-semibold text-foreground">
            {profile?.full_name || user?.email}
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
          <Link
            href="/admin/analizador"
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
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <path d="M7 8h8" />
              <path d="M7 12h10" />
              <path d="M7 16h6" />
            </svg>
            Analizador
            <span className="ml-auto text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">Beta</span>
          </Link>
          <Link
            href="/admin/simplificador"
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
              <path d="M4 7h16" />
              <path d="M4 12h10" />
              <path d="M4 17h6" />
            </svg>
            Simplificador
            <span className="ml-auto text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">Beta</span>
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
      <div className={cn("flex-1 flex flex-col lg:hidden", isPatientDetailPage && "hidden")}>
        <div className="relative flex items-center justify-center p-4 border-b bg-card min-h-14">
          <div className="absolute left-0 top-0 h-full flex items-center">
            <AdminBottomNav />
          </div>
          <span className="text-base font-semibold text-foreground truncate max-w-[70%] mx-auto">
            {profile?.full_name || user?.email}
          </span>
        </div>
      </div>
      <main className="flex-1 p-4 lg:ml-64 lg:p-8 lg:pb-8">
        {children}
      </main>
    </div>
  );
}
