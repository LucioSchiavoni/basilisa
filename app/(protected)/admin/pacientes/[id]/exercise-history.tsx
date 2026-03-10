"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BookOpen, Zap } from "lucide-react";
import { EXPECTED_READING_SPEEDS } from "@/lib/constants/reading-speeds";

type QuestionResult = {
  questionId: string;
  questionText: string;
  patientAnswerText: string;
  correctAnswerText: string;
  isCorrect: boolean;
  timeSpentSeconds: number | null;
};

type ExerciseAttempt = {
  sessionId: string;
  exerciseId: string;
  exerciseTitle: string;
  completedAt: string;
  attemptNumber: number;
  scorePercentage: number;
  correctAnswers: number;
  totalQuestions: number;
  durationSeconds: number;
  readingTimeSeconds: number | null;
  readingPpm: number | null;
  readingWordCount: number | null;
  gemsEarned: number;
  isAssigned: boolean;
  results: QuestionResult[];
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ScoreBadge({ pct }: { pct: number }) {
  const color =
    pct >= 80 ? "text-green-600 bg-green-50 border-green-200" :
    pct >= 60 ? "text-yellow-600 bg-yellow-50 border-yellow-200" :
                "text-red-600 bg-red-50 border-red-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold tabular-nums ${color}`}>
      {pct}%
    </span>
  );
}

function MetricTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-muted/30 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">{icon}{label}</div>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function PpmTile({ ppm, gradeYear }: { ppm: number; gradeYear: number }) {
  const grade = gradeYear >= 1 && gradeYear <= 6 ? gradeYear : 1;
  const expectedPpm = EXPECTED_READING_SPEEDS[grade].textPPM;
  const pct = Math.round((ppm / expectedPpm) * 100);
  const capped = Math.min(pct, 100);

  const barColor =
    pct >= 100 ? "bg-green-500" :
    pct >= 70  ? "bg-yellow-400" :
                 "bg-red-400";

  const statusColor =
    pct >= 100 ? "text-green-600" :
    pct >= 70  ? "text-yellow-600" :
                 "text-red-500";

  const label =
    pct >= 100 ? "Por encima del esperado" :
    pct >= 70  ? "Cerca del esperado" :
                 "Por debajo del esperado";

  return (
    <div className="w-full flex flex-col gap-2 rounded-lg border bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
        <BookOpen className="w-3 h-3" />
        Palabras por minuto
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold tabular-nums">{ppm}</span>
          <span className="text-xs text-muted-foreground">ppm</span>
        </div>
        <div className="text-right">
          <span className={`text-xs font-medium ${statusColor}`}>{label}</span>
          <p className="text-[11px] text-muted-foreground">{pct}% del esperado ({expectedPpm} ppm)</p>
        </div>
      </div>
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${capped}%` }}
        />
        <div
          className="absolute top-0 h-full w-px bg-foreground/25"
          style={{ left: "70%" }}
          title="Mínimo esperado (70%)"
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>0 ppm</span>
        <span>{expectedPpm} ppm</span>
      </div>
    </div>
  );
}

function AttemptModal({
  attempt,
  previousAttempts,
  gradeYear,
  open,
  onClose,
}: {
  attempt: ExerciseAttempt;
  previousAttempts: ExerciseAttempt[];
  gradeYear: number;
  open: boolean;
  onClose: () => void;
}) {
  const hasReading = attempt.readingTimeSeconds != null && attempt.readingTimeSeconds > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-1 pr-6">
          <DialogTitle className="text-base leading-snug">{attempt.exerciseTitle}</DialogTitle>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-xs text-muted-foreground">{formatDate(attempt.completedAt)}</span>
            <Badge variant="outline" className="text-xs py-0 h-5">
              {attempt.isAssigned ? "Asignado" : "Libre"}
            </Badge>
            {attempt.attemptNumber > 1 && (
              <span className="text-xs text-muted-foreground">Intento #{attempt.attemptNumber}</span>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <MetricTile
                icon={<Zap className="w-3 h-3" />}
                label="Puntaje"
                value={`${attempt.scorePercentage}% (${attempt.correctAnswers}/${attempt.totalQuestions})`}
              />
              <MetricTile
                icon={<Clock className="w-3 h-3" />}
                label="Duración total"
                value={formatDuration(attempt.durationSeconds)}
              />
              {hasReading && (
                <MetricTile
                  icon={<BookOpen className="w-3 h-3" />}
                  label="Tiempo lectura"
                  value={formatDuration(attempt.readingTimeSeconds!)}
                />
              )}
              {attempt.readingWordCount != null && (
                <MetricTile
                  icon={<BookOpen className="w-3 h-3" />}
                  label="Palabras leídas"
                  value={`${attempt.readingWordCount}`}
                />
              )}
            </div>
            {attempt.readingPpm != null && (
              <PpmTile ppm={attempt.readingPpm} gradeYear={gradeYear} />
            )}
          </div>

          {previousAttempts.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Intentos anteriores</p>
              <div className="flex flex-col gap-1.5">
                {previousAttempts.map((prev) => (
                  <div key={prev.sessionId} className="flex items-center justify-between gap-2 text-xs rounded-md border px-3 py-2 bg-muted/20">
                    <span className="text-muted-foreground shrink-0">
                      {formatDate(prev.completedAt)} · #{prev.attemptNumber}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <ScoreBadge pct={prev.scorePercentage} />
                      <span className="text-muted-foreground">{formatDuration(prev.durationSeconds)}</span>
                      {prev.readingPpm != null && (
                        <span className="text-muted-foreground">{prev.readingPpm} ppm</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {attempt.results.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Respuestas — {attempt.correctAnswers} correctas · {attempt.totalQuestions - attempt.correctAnswers} incorrectas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {attempt.results.map((r, idx) => (
                  <span
                    key={r.questionId}
                    title={`P${idx + 1}: ${r.questionText}`}
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-semibold border cursor-default ${
                      r.isCorrect
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-600"
                    }`}
                  >
                    {idx + 1}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Pasá el cursor sobre cada número para ver la pregunta
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ExerciseHistory({
  attempts,
  gradeYear,
}: {
  attempts: ExerciseAttempt[];
  gradeYear: number;
}) {
  const [selected, setSelected] = useState<ExerciseAttempt | null>(null);

  const previousAttempts = selected
    ? attempts.filter(
        (a) =>
          a.exerciseId === selected.exerciseId &&
          a.sessionId !== selected.sessionId &&
          new Date(a.completedAt) < new Date(selected.completedAt)
      )
    : [];

  if (attempts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de ejercicios</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8 text-sm">
            El paciente no ha completado ejercicios
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Historial de ejercicios</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {attempts.map((attempt) => (
              <button
                key={attempt.sessionId}
                onClick={() => setSelected(attempt)}
                className="w-full flex items-center gap-3 px-4 sm:px-6 py-3.5 text-left hover:bg-muted/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attempt.exerciseTitle}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(attempt.completedAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {attempt.readingPpm != null && (
                    <span className="hidden sm:inline text-xs text-muted-foreground tabular-nums">
                      {attempt.readingPpm} ppm
                    </span>
                  )}
                  <span className="hidden sm:inline text-xs text-muted-foreground tabular-nums">
                    {formatDuration(attempt.durationSeconds)}
                  </span>
                  <ScoreBadge pct={attempt.scorePercentage} />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selected && (
        <AttemptModal
          attempt={selected}
          previousAttempts={previousAttempts}
          gradeYear={gradeYear}
          open={!!selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
