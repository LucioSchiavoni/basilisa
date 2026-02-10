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
  totalGems: number;
};

export function PatientStatsCards({
  exercisesCompleted,
  averageScore,
  currentStreak,
  totalGems,
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
          <CardDescription>Gemas Totales</CardDescription>
          <CardTitle className="text-3xl sm:text-4xl">{totalGems}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
