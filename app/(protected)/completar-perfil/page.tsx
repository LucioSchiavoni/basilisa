"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeProfile, type ProfileState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, User, Calendar, Phone, KeyRound } from "lucide-react";
import { FloatingParticles } from "@/components/home/floating-particles";
import { createClient } from "@/lib/supabase/client";

const initialState: ProfileState = {};

type ProfileData = {
  full_name: string | null;
  date_of_birth: string | null;
  phone: string | null;
  is_profile_complete: boolean;
};

export default function CompletarPerfilPage() {
  const [state, formAction, pending] = useActionState(completeProfile, initialState);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, date_of_birth, phone, is_profile_complete")
        .eq("id", user.id)
        .single();

      if (profile) {
        setProfileData(profile);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [router]);

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (/\d/.test(e.key)) {
      e.preventDefault();
    }
  }

  function handlePhoneKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  }

  function handlePhoneInput(e: React.FormEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    input.value = input.value.replace(/\D/g, "");
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return "No especificado";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-UY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatPhone(phone: string | null): string {
    if (!phone) return "No especificado";
    // Si el teléfono tiene código de país, mostrarlo formateado
    if (phone.startsWith("+")) {
      const countryCode = phone.substring(0, 4); // +598
      const number = phone.substring(4);
      return `${countryCode} ${number}`;
    }
    return phone;
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden">
        <FloatingParticles />
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si el perfil está completo, mostrar los datos
  if (profileData?.is_profile_complete) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden">
        <FloatingParticles />
        <Card className="w-full max-w-md relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 h-8 w-8"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardHeader className="pt-12">
            <CardTitle>Tu perfil</CardTitle>
            <CardDescription>
              Tu perfil está completo. Aquí están tus datos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Nombre completo</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {profileData.full_name || "No especificado"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Fecha de nacimiento</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {formatDate(profileData.date_of_birth)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {formatPhone(profileData.phone)}
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => router.push("/change-password")}
            >
              <KeyRound className="h-4 w-4" />
              Cambiar contraseña
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/dashboard")}
            >
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si el perfil no está completo, mostrar el formulario
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden">
      <FloatingParticles />
      <Card className="w-full max-w-md relative">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 h-8 w-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <CardHeader className="pt-12">
          <CardTitle>Completa tu perfil</CardTitle>
          <CardDescription>
            Necesitamos algunos datos adicionales para continuar
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            {state.error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Juan Pérez"
                onKeyDown={handleNameKeyDown}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Fecha de nacimiento</Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="flex gap-2">
                <Select name="country_code" defaultValue="+598">
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Código" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+598">🇺🇾 +598</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="91234567"
                  onKeyDown={handlePhoneKeyDown}
                  onInput={handlePhoneInput}
                  className="flex-1"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Guardando..." : "Continuar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => router.push("/change-password")}
            >
              <KeyRound className="h-4 w-4" />
              Cambiar contraseña
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
