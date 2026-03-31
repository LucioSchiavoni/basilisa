const IDL_URL = process.env.IDL_MICROSERVICE_URL || "http://localhost:3001"

export interface StructuralMetrics {
  word_count: number
  sentence_count: number
  avg_words_per_sentence: number
  long_sentence_ratio: number
  avg_letters_per_word: number
  long_word_ratio: number
  avg_syllables_per_word: number
  type_token_ratio: number
  medium_word_ratio: number
  rare_word_ratio: number
}

export interface LexicalMetrics {
  avg_frequency: number
  low_frequency_ratio: number
  complex_syllable_ratio: number
  avg_imageability: number
  imageability_coverage: number
  unknown_word_ratio: number
}

export interface IDLAnalysisResult {
  structural: StructuralMetrics
  lexical: LexicalMetrics
  score: number | null
}

export async function analyzeText(text: string): Promise<IDLAnalysisResult> {
  const res = await fetch(`${IDL_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: text,
  })

  if (!res.ok) {
    throw new Error(`Error del servicio IDL: ${res.status} ${res.statusText}`)
  }

  return res.json()
}
