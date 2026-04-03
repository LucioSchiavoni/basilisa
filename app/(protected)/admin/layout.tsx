import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminLayoutContent } from "./admin-layout-content";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single(),
    supabase
      .from("user_subscriptions")
      .select("status, subscription_plans(name, code)")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .maybeSingle(),
  ]);

  if (profile?.role !== "admin") {
    redirect("/ejercicios");
  }

  const activePlan = subscription?.subscription_plans && !Array.isArray(subscription.subscription_plans)
    ? subscription.subscription_plans
    : null;

  return (
    <AdminLayoutContent
      profile={profile}
      user={user}
    >
      {children}
    </AdminLayoutContent>
  );
}
