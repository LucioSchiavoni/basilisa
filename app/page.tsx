import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#fdfcf6]">
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-[#b41919e3]">
            Basilisa
          </h1>
          <p className="text-lg text-black font-semibold max-w-md mx-auto">
            Tu plataforma para gestionar todo de manera simple y eficiente.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="border">
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border text-black">
            <Link href="/register">Crear Cuenta</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
