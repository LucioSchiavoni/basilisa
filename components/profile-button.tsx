"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { KeyRound, Moon, Sun, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/app/(auth)/actions";

interface ProfileButtonProps {
  fullName: string | null;
  email: string;
  isProfileComplete: boolean;
}

function getInitials(fullName: string | null, email: string) {
  if (fullName) {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

function ThemeToggleRow() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className="flex items-center justify-between px-2 py-1.5 text-sm"
      onMouseDown={(e) => e.preventDefault()} // evita que el dropdown se cierre
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {mounted && isDark ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
        <span>{mounted ? (isDark ? "Modo oscuro" : "Modo claro") : "Tema"}</span>
      </div>

      {/* Toggle switch */}
      <button
        type="button"
        aria-label="Cambiar tema"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${mounted && isDark ? "bg-primary" : "bg-input"
          }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${mounted && isDark ? "translate-x-4" : "translate-x-0"
            }`}
        />
      </button>
    </div>
  );
}

export function ProfileButton({ fullName, email, isProfileComplete }: ProfileButtonProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="h-9 w-9 cursor-pointer">
            <AvatarFallback className="text-xs">
              {getInitials(fullName, email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          className="cursor-pointer flex items-center gap-2"
          onSelect={() => router.push("/change-password")}
        >
          <KeyRound className="h-4 w-4" />
          Cambiar contraseña
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Theme toggle inline */}
        <ThemeToggleRow />

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <form action={logout} className="w-full">
            <button
              type="submit"
              className="w-full flex items-center gap-2 cursor-pointer text-left"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
