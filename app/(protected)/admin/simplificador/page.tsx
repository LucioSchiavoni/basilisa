import { SimplifierPage } from "@/components/simplifier-page"
import { getSimplificationUsage } from "@/lib/actions/simplify-text"

export default async function AdminSimplifierPage() {
  const { usage_today, daily_limit } = await getSimplificationUsage()

  return (
    <SimplifierPage
      mode="admin"
      initialUsageToday={usage_today}
      initialDailyLimit={daily_limit}
    />
  )
}
