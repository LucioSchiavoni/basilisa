"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import type { GlossaryEntry } from "@/lib/actions/simplify-text"
import type { StructuralMetrics, LexicalMetrics } from "@/lib/services/idl"

type Question = {
  question: string
  options: string[]
  correct_index: number
}

type ResultData = {
  simplified_text: string
  glossary: GlossaryEntry[]
  idl_score: number
  metrics: { structural: StructuralMetrics; lexical: LexicalMetrics }
}

type Props = {
  resultData: ResultData
  questions: Question[]
  level: string
  onClose: () => void
}

const LEVEL_LABELS: Record<string, string> = {
  inicial: "Inicial",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
}

const OPTION_LETTERS = ["A", "B", "C", "D"]

function OptionRow({
  icon,
  label,
  detail,
  checked,
  onChange,
  first,
  last,
}: {
  icon: React.ReactNode
  label: string
  detail?: string
  checked: boolean
  onChange: (v: boolean) => void
  first?: boolean
  last?: boolean
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-4 px-4 py-4 cursor-pointer transition-colors select-none",
        checked ? "bg-[#2E85C8]/5" : "hover:bg-muted/40",
        !last && "border-b border-border/30"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
          checked ? "bg-[#2E85C8]/15 text-[#2E85C8]" : "bg-muted/60 text-muted-foreground/50"
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium leading-tight", checked ? "text-foreground" : "text-foreground/70")}>
          {label}
        </p>
        {detail && <p className="text-xs text-muted-foreground/60 mt-0.5">{detail}</p>}
      </div>
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all mr-1",
          checked ? "border-[#2E85C8] bg-[#2E85C8]" : "border-border/50 bg-background"
        )}
      >
        {checked && (
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

export function SimplifierPdfModal({ resultData, questions, level, onClose }: Props) {
  const [includeQuestions, setIncludeQuestions] = useState(questions.length > 0)
  const [includeGlossary, setIncludeGlossary] = useState(resultData.glossary.length > 0)
  const [includeMetrics, setIncludeMetrics] = useState(false)
  const [fileName, setFileName] = useState("texto-simplificado-lisa")
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wordCount = resultData.simplified_text.split(/\s+/).filter(Boolean).length

  async function handleDownload() {
    setGenerating(true)
    setError(null)
    try {
      const { default: jsPDF } = await import("jspdf")
      const doc = new jsPDF({ unit: "mm", format: "a4" })

      const pageW = doc.internal.pageSize.getWidth()
      const pageH = doc.internal.pageSize.getHeight()
      const margin = 20
      const contentW = pageW - margin * 2
      let y = margin

      function checkBreak(needed: number) {
        if (y + needed > pageH - margin) {
          doc.addPage()
          y = margin
        }
      }

      function sectionHeader(title: string) {
        y += 5
        checkBreak(14)
        doc.setFontSize(8.5)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(140, 140, 140)
        doc.text(title, margin, y)
        y += 2
        doc.setDrawColor(220, 220, 220)
        doc.line(margin, y + 1, pageW - margin, y + 1)
        y += 7
      }

      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(20, 20, 20)
      doc.text("Texto Simplificado", margin, y)
      y += 8

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(130, 130, 130)
      doc.text(
        `Nivel: ${LEVEL_LABELS[level] ?? level}   ·   IDL ${resultData.idl_score.toFixed(1)}   ·   ${wordCount} palabras`,
        margin,
        y
      )
      y += 4

      doc.setDrawColor(220, 220, 220)
      doc.line(margin, y + 1, pageW - margin, y + 1)
      y += 9

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(30, 30, 30)
      const textLines = doc.splitTextToSize(resultData.simplified_text, contentW)
      for (const line of textLines) {
        checkBreak(7)
        doc.text(line, margin, y)
        y += 7
      }

      if (includeGlossary && resultData.glossary.length > 0) {
        sectionHeader("PALABRAS DIFÍCILES")
        for (const entry of resultData.glossary) {
          checkBreak(12)
          doc.setFontSize(11)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(46, 133, 200)
          doc.text(entry.term, margin, y)
          const termW = doc.getTextWidth(entry.term)
          doc.setFont("helvetica", "normal")
          doc.setTextColor(80, 80, 80)
          const defLines = doc.splitTextToSize(` — ${entry.definition}`, contentW - termW)
          doc.text(defLines[0], margin + termW, y)
          y += 6.5
          for (let i = 1; i < defLines.length; i++) {
            checkBreak(6.5)
            doc.text(defLines[i], margin, y)
            y += 6.5
          }
        }
      }

      if (includeQuestions && questions.length > 0) {
        sectionHeader("PREGUNTAS DE COMPRENSIÓN")
        questions.forEach((q, qi) => {
          checkBreak(12)
          doc.setFontSize(11)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(20, 20, 20)
          const qLines = doc.splitTextToSize(`${qi + 1}. ${q.question}`, contentW)
          for (const line of qLines) {
            checkBreak(7)
            doc.text(line, margin, y)
            y += 7
          }
          y += 1
          q.options.forEach((opt, oi) => {
            checkBreak(6.5)
            doc.setFontSize(10)
            doc.setFont("helvetica", "normal")
            doc.setTextColor(70, 70, 70)
            const optLines = doc.splitTextToSize(`${OPTION_LETTERS[oi]}. ${opt}`, contentW - 6)
            for (const line of optLines) {
              checkBreak(6.5)
              doc.text(line, margin + 6, y)
              y += 6.5
            }
          })
          y += 4
        })
      }

      if (includeMetrics) {
        sectionHeader("MÉTRICAS")
        const { structural, lexical } = resultData.metrics
        const rows: [string, string][] = [
          ["Palabras por oración", structural.avg_words_per_sentence.toFixed(1)],
          ["Letras por palabra", structural.avg_letters_per_word.toFixed(1)],
          ["Oraciones largas", `${(structural.long_sentence_ratio * 100).toFixed(0)}%`],
          ["Palabras medianas", `${(structural.medium_word_ratio * 100).toFixed(0)}%`],
          ["Palabras largas", `${(structural.rare_word_ratio * 100).toFixed(0)}%`],
          ["Frecuencia léxica", lexical.avg_frequency.toFixed(2)],
          ["Imaginabilidad", lexical.avg_imageability.toFixed(2)],
        ]
        for (const [label, value] of rows) {
          checkBreak(7)
          doc.setFontSize(10)
          doc.setFont("helvetica", "normal")
          doc.setTextColor(80, 80, 80)
          doc.text(label, margin, y)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(20, 20, 20)
          doc.text(value, pageW - margin, y, { align: "right" })
          y += 7
        }
      }

      const finalName = fileName.trim() || "texto-simplificado-lisa"
      doc.save(`${finalName}.pdf`)
      onClose()
    } catch {
      setError("No se pudo generar el PDF. Intentá de nuevo.")
    } finally {
      setGenerating(false)
    }
  }

  const optionalItems = [
    questions.length > 0 && {
      key: "questions",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
        </svg>
      ),
      label: "Preguntas de comprensión",
      detail: `${questions.length} ${questions.length === 1 ? "pregunta" : "preguntas"}`,
      checked: includeQuestions,
      onChange: setIncludeQuestions,
    },
    resultData.glossary.length > 0 && {
      key: "glossary",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
      label: "Palabras difíciles",
      detail: `${resultData.glossary.length} ${resultData.glossary.length === 1 ? "término" : "términos"}`,
      checked: includeGlossary,
      onChange: setIncludeGlossary,
    },
    {
      key: "metrics",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      label: "Métricas del texto",
      detail: "Análisis estructural y léxico",
      checked: includeMetrics,
      onChange: setIncludeMetrics,
    },
  ].filter(Boolean) as {
    key: string
    icon: React.ReactNode
    label: string
    detail?: string
    checked: boolean
    onChange: (v: boolean) => void
  }[]

  return createPortal(
    <>
      <div className="fixed inset-0 z-80 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-3 top-1/2 -translate-y-1/2 rounded-2xl border border-border/60 bg-card shadow-2xl sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-145"
        style={{ zIndex: 90 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center px-6 pt-6 pb-5 border-b border-border/40">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: "#2E85C8" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground">Exportar como PDF</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Elegí qué secciones incluir en el documento</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground cursor-pointer ml-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 mt-5 mb-4">
          <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-2">
            Nombre del archivo
          </label>
          <div className="flex items-center rounded-xl border border-border/50 bg-background overflow-hidden focus-within:border-[#2E85C8]/50 transition-colors">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="texto-simplificado-lisa"
              className="flex-1 min-w-0 px-4 py-3 text-sm text-foreground bg-transparent focus:outline-none placeholder:text-muted-foreground/40"
            />
            <span className="shrink-0 pr-4 text-sm text-muted-foreground/40 select-none">.pdf</span>
          </div>
        </div>

        <div className="px-6 mb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40">Secciones opcionales</p>
        </div>
        <div className="mx-6 mb-5 rounded-xl border border-border/40 overflow-hidden">
          {optionalItems.map((item, i) => (
            <OptionRow
              key={item.key}
              icon={item.icon}
              label={item.label}
              detail={item.detail}
              checked={item.checked}
              onChange={item.onChange}
              first={i === 0}
              last={i === optionalItems.length - 1}
            />
          ))}
        </div>

        {error && (
          <p className="px-6 -mt-3 mb-4 text-sm text-red-500">{error}</p>
        )}

        <div className="flex flex-col gap-3 px-6 pt-1 pb-10">
          <button
            type="button"
            onClick={handleDownload}
            disabled={generating}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            style={{ backgroundColor: "#2E85C8" }}
          >
            {generating ? (
              <>
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generando PDF...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                Descargar PDF
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-full items-center justify-center rounded-xl border border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
