"use client";

import { useActionState, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { editProfile, type EditProfileState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Camera, User } from "lucide-react";
import { FloatingParticles } from "@/components/home/floating-particles";
import { createClient } from "@/lib/supabase/client";
import { TutorialSpotlight } from "@/components/tutorial-spotlight";

type ProfileData = {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
};

const initialState: EditProfileState = {};

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

function extractPhone(phone: string | null): { countryCode: string; number: string } {
  if (!phone) return { countryCode: "+598", number: "" };
  if (phone.startsWith("+598")) return { countryCode: "+598", number: phone.slice(4) };
  if (phone.startsWith("+")) return { countryCode: "+598", number: phone.slice(4) };
  return { countryCode: "+598", number: phone };
}

function EditarPerfilContent() {
  const [state, formAction, pending] = useActionState(editProfile, initialState);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tutorial = searchParams.get("tutorial") as "full_name" | "phone" | null;

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        setProfileData(profile);
        setAvatarUrl(profile.avatar_url);
        setFullName(profile.full_name ?? "");
        setPhoneNum(extractPhone(profile.phone).number);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [router]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    setAvatarUploading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAvatarUploading(false);
      return;
    }

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setAvatarError("No se pudo subir la imagen");
      setAvatarUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(urlData.publicUrl);
    setAvatarUploading(false);
  }

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (/\d/.test(e.key)) e.preventDefault();
  }

  function handlePhoneKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
  }

  function handlePhoneInput(e: React.FormEvent<HTMLInputElement>) {
    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
      </div>
    );
  }

  const { countryCode } = extractPhone(profileData?.phone ?? null);
  const initials = getInitials(profileData?.full_name ?? null, userEmail);

  const isDirty = profileData !== null && (
    fullName !== (profileData.full_name ?? "") ||
    phoneNum !== extractPhone(profileData.phone).number ||
    avatarUrl !== (profileData.avatar_url ?? null)
  );

  return (
    <div className="relative space-y-6 max-w-xl mx-auto">
      {tutorial && (
        <Suspense>
          <TutorialSpotlight targetField={tutorial} />
        </Suspense>
      )}
      <FloatingParticles />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Editar perfil</h1>
      </div>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="avatar_url" value={avatarUrl ?? ""} />

        <div className="flex flex-col items-center gap-3 py-6 rounded-2xl border border-border/50 bg-transparent backdrop-blur-sm">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
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
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {avatarUploading ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-background" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          {avatarError && <p className="text-xs text-red-500">{avatarError}</p>}
          <p className="text-xs text-muted-foreground">Toca la cámara para cambiar tu foto</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-transparent backdrop-blur-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Datos personales
            </p>
          </div>
          <div className="p-5 space-y-4">
            {state.error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-xl">
                {state.error}
              </div>
            )}

            <div className="space-y-2" data-spotlight="full_name">
              <Label htmlFor="full_name" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Nombre completo
              </Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan Pérez"
                autoFocus={tutorial === "full_name"}
              />
            </div>

            <div className="space-y-2" data-spotlight="phone">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="flex gap-2">
                <Select name="country_code" defaultValue={countryCode}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
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
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value.replace(/\D/g, ""))}
                  placeholder="91234567"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full bg-[#579F93] hover:bg-[#4a8e83] text-white" disabled={!isDirty || pending || avatarUploading}>
          {pending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </div>
  );
}

export default function EditarPerfilPage() {
  return (
    <Suspense>
      <EditarPerfilContent />
    </Suspense>
  );
}
