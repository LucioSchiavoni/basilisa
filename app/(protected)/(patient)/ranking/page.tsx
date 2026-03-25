import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GemIcon } from "@/components/gem-icon";

type RankEntry = {
  user_id: string;
  total_gems: number;
  profiles: { full_name: string | null } | null;
};

const MEDAL_EMOJI = ["🥇", "🥈", "🥉"] as const;
const MEDAL_COLORS = ["#F59E0B", "#9CA3AF", "#B45309"] as const;

function getInitials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function RankingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminClient = createAdminClient();

  const [{ data: raw }, { data: myRawData }] = await Promise.all([
    adminClient
      .from("user_gems")
      .select("user_id, total_gems, profiles(full_name)")
      .order("total_gems", { ascending: false })
      .limit(50),
    adminClient
      .from("user_gems")
      .select("user_id, total_gems, profiles(full_name)")
      .eq("user_id", user!.id)
      .maybeSingle(),
  ]);

  const ranking = (raw ?? []) as unknown as RankEntry[];
  const myEntry = myRawData as unknown as RankEntry | null;
  const myIndex = ranking.findIndex((r) => r.user_id === user!.id);

  let myRank = myIndex >= 0 ? myIndex + 1 : 0;
  if (myIndex === -1 && myEntry) {
    const { count } = await adminClient
      .from("user_gems")
      .select("*", { count: "exact", head: true })
      .gt("total_gems", myEntry.total_gems);
    myRank = (count ?? 0) + 1;
  }

  return (
    <div className="space-y-5">

      <div>
        <h1 className="text-2xl font-bold text-foreground">Ranking</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Los lectores con más gemas
        </p>
      </div>

      {myRank > 0 && myEntry && (
        <div className="rounded-2xl border-2 border-[#579F93]/40 bg-[#579F93]/8 p-3 flex items-center gap-3">
          <span className="text-sm font-bold text-[#579F93] w-8 text-center shrink-0">
            #{myRank}
          </span>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{
              background: myRank <= 3 ? MEDAL_COLORS[myRank - 1] : "#579F93",
            }}
          >
            {getInitials(myEntry.profiles?.full_name ?? null)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#579F93] truncate">
              {myEntry.profiles?.full_name ?? "Vos"}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (vos)
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <GemIcon size={22} />
            <span className="font-bold text-base text-[#579F93]">
              {myEntry.total_gems.toLocaleString("es-AR")}
            </span>
          </div>
        </div>
      )}

      {ranking.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border border-dashed border-border bg-card/50">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <span className="text-3xl">🏆</span>
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Nadie tiene gemas todavía</p>
            <p className="text-sm text-muted-foreground mt-1">
              ¡Completá ejercicios para aparecer acá!
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {ranking.map((entry, index) => {
            const rank = index + 1;
            const isMe = entry.user_id === user!.id;
            const medalColor = rank <= 3 ? MEDAL_COLORS[rank - 1] : null;
            const name = entry.profiles?.full_name ?? "Lector";
            const initials = getInitials(name);

            return (
              <div
                key={entry.user_id}
                className={`flex items-center gap-3 px-4 py-3 transition-all ${
                  index !== ranking.length - 1 ? "border-b border-border" : ""
                } ${isMe ? "bg-[#579F93]/8" : ""}`}
              >
                <div className="w-8 text-center shrink-0">
                  {rank <= 3 ? (
                    <span className="text-xl leading-none">{MEDAL_EMOJI[rank - 1]}</span>
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">
                      #{rank}
                    </span>
                  )}
                </div>

                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{
                    background: medalColor ?? (isMe ? "#579F93" : "#94a3b8"),
                  }}
                >
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: isMe ? "#579F93" : undefined }}
                  >
                    {name}
                    {isMe && (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        (vos)
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <GemIcon size={22} />
                  <span
                    className="font-bold text-base"
                    style={{ color: medalColor ?? (isMe ? "#579F93" : undefined) }}
                  >
                    {entry.total_gems.toLocaleString("es-AR")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
