import { SimplifierPage } from "@/components/simplifier-page"
import { getSimplificationUsage } from "@/lib/actions/simplify-text"
import { getQuestionGenerationUsage } from "@/lib/actions/generate-questions"

export default async function PatientSimplifierPage() {
  const [{ usage_today, daily_limit }, { usage_today: q_usage, daily_limit: q_limit }] = await Promise.all([
    getSimplificationUsage(),
    getQuestionGenerationUsage(),
  ])

  return (
    <SimplifierPage
      mode="patient"
      initialUsageToday={usage_today}
      initialDailyLimit={daily_limit}
      initialQuestionsUsageToday={q_usage}
      initialQuestionsLimit={q_limit}
    />
  )
}
