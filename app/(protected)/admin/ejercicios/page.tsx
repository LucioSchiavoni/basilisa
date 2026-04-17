import Link from "next/link";
import { ArrowRight, ClipboardList, Plus } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { getScheme } from "@/app/(protected)/ejercicios/(browse)/mundos/world-color-schemes";

export default async function AdminExercisesPage() {
  const adminClient = createAdminClient();

  const [{ data: worlds }, { data: worldExercises }, { data: mathType }] = await Promise.all([
    adminClient
      .from("worlds")
      .select("id, name, display_name, sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    adminClient
      .from("world_exercises")
      .select("world_id"),
    adminClient
      .from("exercise_types")
      .select("id")
      .eq("name", "math")
      .maybeSingle(),
  ]);

  const totals = new Map<string, number>();
  for (const row of worldExercises ?? []) {
    totals.set(row.world_id, (totals.get(row.world_id) ?? 0) + 1);
  }

  let mathCount = 0;
  if (mathType) {
    const { count } = await adminClient
      .from("exercises")
      .select("id", { count: "exact", head: true })
      .eq("exercise_type_id", mathType.id)
      .is("deleted_at", null);
    mathCount = count ?? 0;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Gestión de ejercicios</h1>
          <p className="text-sm text-muted-foreground">
            Entrá a cada mundo para ver y ordenar sus ejercicios con drag and drop.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/ejercicios/todos">
              <ClipboardList className="mr-2 h-4 w-4" />
              Ver todos
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/ejercicios/crear">
              <Plus className="mr-2 h-4 w-4" />
              Crear ejercicio
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6 pt-3">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(worlds ?? []).map((world) => {
            const config = getScheme(world.name);
            return (
              <div
                key={world.id}
                className="rounded-2xl border bg-card p-6 transition-colors hover:border-primary hover:bg-accent/20"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Mundo {world.sort_order}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">{world.display_name}</h2>
                  </div>
                  <div
                    className="h-3 w-3 rounded-full border border-white/30"
                    style={{ backgroundColor: config.accentColor }}
                  />
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{totals.get(world.id) ?? 0}</span> ejercicios
                </p>

                <Button className="mt-6 w-full justify-between" asChild>
                  <Link
                    href={`/admin/ejercicios/mundos/${world.id}`}
                    className="group/button shadow-sm transition-all hover:shadow-md"
                    style={{
                      background: config.buttonGradient,
                      color: config.accentFg,
                    }}
                  >
                    <span className="font-semibold">Ver ejercicios del mundo</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-0.5" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border bg-card p-6 transition-colors hover:border-primary hover:bg-accent/20 md:max-w-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Área especial
              </p>
              <h2 className="mt-1 text-xl font-semibold">Matemáticas</h2>
            </div>
            <div className="h-3 w-3 rounded-full border border-white/30 bg-[#C73341]" />
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{mathCount}</span> ejercicios
          </p>

          <Button className="mt-6 w-full justify-between" asChild>
            <Link
              href="/admin/ejercicios/matematicas"
              className="group/button shadow-sm transition-all hover:shadow-md"
              style={{
                background: "linear-gradient(135deg, #C73341 0%, #a0212d 100%)",
                color: "#ffffff",
              }}
            >
              <span className="font-semibold">Ver ejercicios de matemáticas</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
