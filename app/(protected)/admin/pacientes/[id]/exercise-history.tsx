"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  exerciseTitle: string;
  completedAt: string;
  scorePercentage: number;
  correctAnswers: number;
  totalQuestions: number;
  durationSeconds: number;
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
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ExerciseHistory({
  attempts,
}: {
  attempts: ExerciseAttempt[];
}) {
  if (attempts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ejercicios</CardTitle>
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
    <Card>
      <CardHeader>
        <CardTitle>Historial de Ejercicios</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {attempts.map((attempt) => (
            <AccordionItem key={attempt.sessionId} value={attempt.sessionId}>
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left w-full pr-4">
                  <span className="font-medium text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">
                    {attempt.exerciseTitle}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(attempt.completedAt)}
                    </span>
                    <Badge
                      variant={
                        attempt.scorePercentage >= 80
                          ? "default"
                          : attempt.scorePercentage >= 60
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-xs"
                    >
                      {attempt.scorePercentage}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {attempt.correctAnswers}/{attempt.totalQuestions}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(attempt.durationSeconds)}
                    </span>
                    {attempt.gemsEarned > 0 && (
                      <Badge variant="outline" className="text-xs">
                        +{attempt.gemsEarned} gemas
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {attempt.results.map((result, idx) => (
                    <div
                      key={result.questionId}
                      className={`rounded-lg border p-3 ${
                        result.isCorrect
                          ? "border-green-500/30 bg-green-500/5"
                          : "border-red-500/30 bg-red-500/5"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                            result.isCorrect ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          {result.isCorrect ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" x2="6" y1="6" y2="18" />
                              <line x1="6" x2="18" y1="6" y2="18" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">
                            P{idx + 1}: {result.questionText}
                          </p>
                          <p className="text-xs mt-1">
                            <span className="text-muted-foreground">
                              Respuesta:{" "}
                            </span>
                            <span
                              className={
                                result.isCorrect
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }
                            >
                              {result.patientAnswerText}
                            </span>
                          </p>
                          {!result.isCorrect && (
                            <p className="text-xs mt-0.5">
                              <span className="text-muted-foreground">
                                Correcta:{" "}
                              </span>
                              <span className="text-green-600 dark:text-green-400">
                                {result.correctAnswerText}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
