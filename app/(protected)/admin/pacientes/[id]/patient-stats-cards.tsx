import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StatsCardsProps = {
  exercisesCompleted: number;
  averageScore: number;
  currentStreak: number;
  gradeYear: number | null;
};

export function PatientStatsCards({
  exercisesCompleted,
  averageScore,
  currentStreak,
  gradeYear,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardDescription>Ejercicios Completados</CardDescription>
          <CardTitle className="text-3xl sm:text-4xl">
            {exercisesCompleted}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Promedio Score</CardDescription>
          <CardTitle className="text-3xl sm:text-4xl">
            {averageScore}%
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Racha Actual</CardDescription>
          <CardTitle className="text-3xl sm:text-4xl">
            {currentStreak}
            <span className="text-base font-normal text-muted-foreground ml-1">
              d
            </span>
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Año cursando</CardDescription>
          <CardTitle className="text-3xl sm:text-4xl">
            {gradeYear ?? "—"}
            {gradeYear && (
              <span className="text-base font-normal text-muted-foreground ml-1">°</span>
            )}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
