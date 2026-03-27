function getInitials(fullName: string | null, email: string) {
  if (fullName) {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  return email[0].toUpperCase()
}

interface PatientProfileCardProps {
  fullName: string | null
  email: string
  totalCompleted: number
  totalExercises: number
}

export function PatientProfileCard({
  fullName,
  email,
  totalCompleted,
  totalExercises,
}: PatientProfileCardProps) {
  const initials = getInitials(fullName, email)
  const progressPct = totalExercises > 0 ? Math.round((totalCompleted / totalExercises) * 100) : 0

  return (
    <div
      className="rounded-2xl border bg-card p-5 flex flex-col items-center gap-4"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
    >
      <div
        className="flex items-center justify-center rounded-full text-white font-bold"
        style={{
          width: 72,
          height: 72,
          fontSize: 26,
          background: "linear-gradient(135deg, #C73341 0%, #e05a27 100%)",
          fontFamily: "var(--font-lexend)",
          flexShrink: 0,
        }}
      >
        {initials}
      </div>

      <div className="flex flex-col items-center gap-0.5 w-full text-center">
        {fullName && (
          <p
            className="font-bold text-foreground leading-tight"
            style={{ fontSize: 17, fontFamily: "var(--font-lexend)" }}
          >
            {fullName}
          </p>
        )}
        <p className="text-muted-foreground text-xs truncate w-full text-center">{email}</p>
      </div>

      <div className="w-full h-px bg-border" />

      <div className="w-full flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Progreso total</span>
          <span className="font-semibold text-foreground">{totalCompleted}/{totalExercises}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, #C73341 0%, #e05a27 100%)",
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-right">{progressPct}% completado</p>
      </div>
    </div>
  )
}
