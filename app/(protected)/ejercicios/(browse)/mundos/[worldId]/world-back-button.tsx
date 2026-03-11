"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function WorldBackButton({
  worldName: _worldName,
  displayName: _displayName,
}: {
  worldName: string;
  displayName: string;
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/ejercicios")}
      className="relative z-50 inline-flex items-center gap-1.5 text-sm font-semibold mb-6 px-3 py-1.5 rounded-xl"
      style={{ color: "#0B1926", background: "white" }}
    >
      <ArrowLeft className="h-4 w-4" />
      Volver
    </button>
  );
}
