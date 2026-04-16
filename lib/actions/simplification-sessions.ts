"use server"

import { createClient } from "@/lib/supabase/server"
import type { GlossaryEntry } from "@/lib/actions/simplify-text"
import type { StructuralMetrics, LexicalMetrics } from "@/lib/services/idl"

type Question = {
  question: string
  options: string[]
  correct_index: number
}

type SaveSessionInput = {
  original_text: string
  simplified_text: string
  level: "inicial" | "intermedio" | "avanzado"
  idl_score: number
  glossary: GlossaryEntry[]
  metrics: { structural: StructuralMetrics; lexical: LexicalMetrics }
}

export type SessionRow = {
  id: string
  original_text: string
  simplified_text: string
  level: string
  idl_score: number
  glossary: GlossaryEntry[]
  metrics: { structural: StructuralMetrics; lexical: LexicalMetrics }
  questions: Question[]
  created_at: string
}

export async function saveSimplificationSession(input: SaveSessionInput): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("simplification_sessions")
    .insert({
      user_id: user.id,
      original_text: input.original_text,
      simplified_text: input.simplified_text,
      level: input.level,
      idl_score: input.idl_score,
      glossary: input.glossary as never,
      metrics: input.metrics as never,
      questions: [] as never,
    })
    .select("id")
    .single()

  if (error) return null
  return data.id
}

export async function updateSessionQuestions(id: string, questions: Question[]): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from("simplification_sessions")
    .update({ questions: questions as never })
    .eq("id", id)
}

export async function getSimplificationSessions(): Promise<SessionRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("simplification_sessions")
    .select("id, original_text, simplified_text, level, idl_score, glossary, metrics, questions, created_at")
    .order("created_at", { ascending: false })
    .limit(20)

  if (!data) return []
  return data.map((row) => ({
    id: row.id,
    original_text: row.original_text,
    simplified_text: row.simplified_text,
    level: row.level,
    idl_score: row.idl_score,
    glossary: (row.glossary as GlossaryEntry[]) ?? [],
    metrics: row.metrics as { structural: StructuralMetrics; lexical: LexicalMetrics },
    questions: (row.questions as Question[]) ?? [],
    created_at: row.created_at,
  }))
}
