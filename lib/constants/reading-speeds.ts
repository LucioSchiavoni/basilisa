export const EXPECTED_READING_SPEEDS: Record<number, { wordListPPM: number; textPPM: number }> = {
  1: { wordListPPM: 21, textPPM: 45 },
  2: { wordListPPM: 32, textPPM: 69 },
  3: { wordListPPM: 40, textPPM: 75 },
  4: { wordListPPM: 45, textPPM: 78 },
  5: { wordListPPM: 55, textPPM: 100 },
  6: { wordListPPM: 60, textPPM: 100 },
};

export function calculateMaxReadingTime(
  wordCount: number,
  gradeYear: number,
  exerciseType: "text" | "word_list"
): number {
  const grade = gradeYear >= 1 && gradeYear <= 6 ? gradeYear : 1;
  const speeds = EXPECTED_READING_SPEEDS[grade];
  const expectedPPM = exerciseType === "text" ? speeds.textPPM : speeds.wordListPPM;
  return Math.ceil((wordCount / expectedPPM) * 60);
}

export function calculatePPM(wordCount: number, timeSeconds: number): number {
  if (timeSeconds <= 0) return 0;
  return Math.round(((wordCount / timeSeconds) * 60) * 10) / 10;
}

export function calculatePerformancePercentage(realPPM: number, expectedPPM: number): number {
  if (expectedPPM === 0) return 0;
  return Math.round((realPPM / expectedPPM) * 100 * 10) / 10;
}

export function getExerciseWordCount(content: Record<string, unknown>): number | null {
  if (typeof content.word_count === "number" && content.word_count > 0) {
    return content.word_count;
  }
  if (typeof content.reading_text === "string") {
    const words = content.reading_text.split(/\s+/).filter(Boolean);
    return words.length;
  }
  return null;
}
