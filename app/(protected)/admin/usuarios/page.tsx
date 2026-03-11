import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UsersList } from "./users-list";
import { UsersSearch } from "./users-search";

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminClient = createAdminClient();

  let query = adminClient
    .from("profiles")
    .select("id, full_name, role, email, created_at, is_profile_complete, needs_grade_review, grade_year, must_change_password", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q?.trim()) {
    query = query.or(`full_name.ilike.%${q.trim()}%,email.ilike.%${q.trim()}%`);
  }

  const { data: profiles, count } = await query;

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const paginationBase = q?.trim() ? `/admin/usuarios?q=${encodeURIComponent(q.trim())}` : "/admin/usuarios";

  const usersWithDetails = (profiles ?? []).map((profile) => {
    const isPatient = (profile.email ?? "").endsWith("@basilisa.internal");
    return {
      ...profile,
      email: profile.email ?? "N/A",
      is_patient: isPatient,
      username: isPatient ? (profile.email ?? "").replace("@basilisa.internal", "") : null,
      must_change_password: profile.must_change_password ?? false,
    };
  });

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold sm:text-3xl">Gestión de Usuarios</h1>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Usuarios</h2>
            <p className="text-sm text-muted-foreground">
              {q?.trim() ? `${count ?? 0} resultados` : `${count ?? 0} registrados`}
            </p>
          </div>
        </div>
        <UsersSearch />
        <UsersList users={usersWithDetails} currentUserId={user!.id} />
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            {page > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={page > 2 ? `${paginationBase}&page=${page - 1}` : paginationBase}>
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
            {page < totalPages ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`${paginationBase}&page=${page + 1}`}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </section>

    </div>
  );
}
