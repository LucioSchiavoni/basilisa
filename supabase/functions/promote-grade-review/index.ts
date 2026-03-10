import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cronSecret = Deno.env.get("CRON_SECRET");
  const authHeader = req.headers.get("Authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: patients, error: selectError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "patient")
      .eq("is_active", true)
      .eq("needs_grade_review", false)
      .gte("grade_year", 1)
      .lte("grade_year", 5);

    if (selectError) throw new Error(selectError.message);

    const ids = (patients ?? []).map((p: { id: string }) => p.id);

    if (ids.length === 0) {
      return new Response(
        JSON.stringify({ updated_count: 0, timestamp: new Date().toISOString() }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ needs_grade_review: true, promotion_suggested_at: now })
      .in("id", ids);

    if (updateError) throw new Error(updateError.message);

    return new Response(
      JSON.stringify({ updated_count: ids.length, timestamp: now }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
