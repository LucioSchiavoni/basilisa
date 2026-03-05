"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, Check, ClipboardList, ArrowLeft, X, Plus, CalendarDays } from "lucide-react"
import { assignExercisesBulk } from "./actions"
import { cn } from "@/lib/utils"
import { DatePicker } from "@/components/ui/date-picker"

type Patient = {
  id: string
  full_name: string | null
  username: string | null
  is_patient: boolean
}

type Exercise = {
  id: string
  title: string
  exerciseTypeDisplayName: string
  difficultyLevel: number
}

type QueuedAssignment = {
  exerciseId: string
  title: string
  exerciseTypeDisplayName: string
  startDate: string
  dueDate: string
}

const difficultyLabel = (level: number) => {
  const labels: Record<number, string> = { 1: "Muy fácil", 2: "Fácil", 3: "Medio", 4: "Difícil", 5: "Muy difícil", 6: "Experto" }
  return labels[level] || `Nivel ${level}`
}

function getInitials(name: string | null, username: string | null) {
  if (name) return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
  if (username) return username.slice(0, 2).toUpperCase()
  return "?"
}

export function AssignExercisesDashboardDialog({ patients, exercises }: { patients: Patient[]; exercises: Exercise[] }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  const [patientSearch, setPatientSearch] = useState("")
  const [selectedPatientId, setSelectedPatientId] = useState("")

  const [exerciseSearch, setExerciseSearch] = useState("")
  const [pickingExerciseId, setPickingExerciseId] = useState<string | null>(null)
  const [currentStartDate, setCurrentStartDate] = useState("")
  const [currentDueDate, setCurrentDueDate] = useState("")

  const [queue, setQueue] = useState<QueuedAssignment[]>([])
  const [animatingId, setAnimatingId] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const queueEndRef = useRef<HTMLDivElement>(null)

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)
  const queuedIds = new Set(queue.map((q) => q.exerciseId))
  const pickingExercise = exercises.find((e) => e.id === pickingExerciseId)

  const filteredPatients = patients.filter((p) => {
    const q = patientSearch.toLowerCase()
    return p.full_name?.toLowerCase().includes(q) || p.username?.toLowerCase().includes(q)
  })

  const filteredExercises = exercises.filter((e) =>
    !queuedIds.has(e.id) && e.title.toLowerCase().includes(exerciseSearch.toLowerCase())
  )

  function reset() {
    setStep(1)
    setPatientSearch("")
    setSelectedPatientId("")
    setExerciseSearch("")
    setPickingExerciseId(null)
    setCurrentStartDate("")
    setCurrentDueDate("")
    setQueue([])
    setAnimatingId(null)
    setError(null)
    setSuccessMsg(null)
  }

  function selectPatient(id: string) {
    setSelectedPatientId(id)
    setError(null)
    setSuccessMsg(null)
    setStep(2)
  }

  function selectExercise(id: string) {
    setPickingExerciseId(id)
    setCurrentStartDate("")
    setCurrentDueDate("")
    setError(null)
  }

  function cancelPicking() {
    setPickingExerciseId(null)
    setCurrentStartDate("")
    setCurrentDueDate("")
  }

  function addToQueue() {
    if (!pickingExerciseId || !pickingExercise) return

    const newItem: QueuedAssignment = {
      exerciseId: pickingExerciseId,
      title: pickingExercise.title,
      exerciseTypeDisplayName: pickingExercise.exerciseTypeDisplayName,
      startDate: currentStartDate,
      dueDate: currentDueDate,
    }

    setQueue((prev) => [...prev, newItem])
    setAnimatingId(pickingExerciseId)
    setTimeout(() => setAnimatingId(null), 400)

    setPickingExerciseId(null)
    setCurrentStartDate("")
    setCurrentDueDate("")
    setExerciseSearch("")
    setSuccessMsg(null)

    setTimeout(() => {
      queueEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 50)
  }

  function removeFromQueue(exerciseId: string) {
    setQueue((prev) => prev.filter((q) => q.exerciseId !== exerciseId))
  }

  async function handleSubmit() {
    if (!selectedPatientId || queue.length === 0) return
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    const result = await assignExercisesBulk({
      patientId: selectedPatientId,
      assignments: queue.map((q) => ({
        exerciseId: q.exerciseId,
        startDate: q.startDate || null,
        dueDate: q.dueDate || null,
      })),
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    const skippedMsg = result.skipped ? ` · ${result.skipped} ya asignado${result.skipped !== 1 ? "s" : ""}` : ""
    setSuccessMsg(`${result.assigned} ejercicio${result.assigned !== 1 ? "s" : ""} asignado${result.assigned !== 1 ? "s" : ""}${skippedMsg}`)
    setQueue([])
    setPickingExerciseId(null)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button className="w-full h-auto py-4 flex-col gap-1.5">
          <ClipboardList className="h-5 w-5" />
          <span className="font-semibold">Asignar ejercicios</span>
          <span className="text-xs font-normal opacity-80">Asigna uno o más ejercicios a un paciente</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <style>{`
          @keyframes slideInItem {
            from { opacity: 0; transform: translateY(-6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .anim-slide-in { animation: slideInItem 0.3s ease-out; }
          @keyframes slideDownPanel {
            from { opacity: 0; transform: translateY(-4px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .anim-slide-down { animation: slideDownPanel 0.2s ease-out; }
        `}</style>

        <DialogHeader className="px-5 pt-5 pb-3 shrink-0 border-b">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                type="button"
                onClick={() => { setStep(1); setPickingExerciseId(null); setError(null) }}
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <DialogTitle className="text-base">
              {step === 1 ? "¿A quién le asignás?" : "Configurar ejercicios"}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className={cn("flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors",
              step === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>1 Paciente</div>
            <div className="h-px flex-1 bg-border" />
            <div className={cn("flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors",
              step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>2 Ejercicios</div>
          </div>
        </DialogHeader>

        {step === 1 && (
          <div className="flex flex-col flex-1 min-h-0 px-5 py-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o usuario..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto divide-y border rounded-xl">
              {filteredPatients.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground text-center">Sin resultados</p>
              ) : filteredPatients.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPatient(p.id)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-accent/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                    {getInitials(p.full_name, p.username)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.full_name || "Sin nombre"}</p>
                    {p.username && <p className="text-xs text-muted-foreground">@{p.username}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">

              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50 border">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                  {getInitials(selectedPatient?.full_name ?? null, selectedPatient?.username ?? null)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{selectedPatient?.full_name || "Sin nombre"}</p>
                  {selectedPatient?.username && <p className="text-xs text-muted-foreground">@{selectedPatient.username}</p>}
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-primary hover:underline shrink-0">
                  Cambiar
                </button>
              </div>

              {successMsg && (
                <div className="p-3 text-sm text-green-700 bg-green-50 rounded-lg dark:bg-green-900/20 dark:text-green-400">
                  ✓ {successMsg}
                </div>
              )}
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              {queue.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Para asignar</p>
                    <Badge variant="secondary" className="text-xs">{queue.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {queue.map((item) => (
                      <div
                        key={item.exerciseId}
                        className={cn(
                          "flex items-start gap-3 px-3 py-2.5 rounded-xl border bg-card",
                          animatingId === item.exerciseId && "anim-slide-in"
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-xs text-muted-foreground">{item.exerciseTypeDisplayName}</span>
                            {(item.startDate || item.dueDate) && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <CalendarDays className="h-3 w-3" />
                                {item.startDate && <span>{item.startDate}</span>}
                                {item.startDate && item.dueDate && <span>→</span>}
                                {item.dueDate && <span>{item.dueDate}</span>}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromQueue(item.exerciseId)}
                          className="shrink-0 h-6 w-6 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <div ref={queueEndRef} />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {!pickingExerciseId ? (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {queue.length > 0 ? "Agregar otro" : "Agregar ejercicio"}
                    </p>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar ejercicio..."
                        value={exerciseSearch}
                        onChange={(e) => setExerciseSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="border rounded-xl overflow-hidden max-h-48 overflow-y-auto divide-y">
                      {filteredExercises.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground text-center">
                          {exercises.length === queuedIds.size ? "Todos los ejercicios ya fueron agregados" : "Sin resultados"}
                        </p>
                      ) : filteredExercises.map((exercise) => (
                        <button
                          key={exercise.id}
                          type="button"
                          onClick={() => selectExercise(exercise.id)}
                          className="w-full text-left px-3 py-2.5 flex items-center justify-between gap-3 hover:bg-accent/50 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{exercise.title}</p>
                            <p className="text-xs text-muted-foreground">{exercise.exerciseTypeDisplayName} · {difficultyLabel(exercise.difficultyLevel)}</p>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="anim-slide-down space-y-3 border rounded-xl p-4 bg-muted/30">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded bg-primary flex items-center justify-center shrink-0">
                            <Check className="h-2.5 w-2.5 text-primary-foreground" />
                          </div>
                          <p className="text-sm font-medium truncate">{pickingExercise?.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 ml-6">{pickingExercise?.exerciseTypeDisplayName} · {difficultyLabel(pickingExercise?.difficultyLevel ?? 1)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={cancelPicking}
                        className="shrink-0 h-6 w-6 flex items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Inicio <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                        <DatePicker value={currentStartDate} onChange={setCurrentStartDate} placeholder="Fecha inicio" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Límite <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                        <DatePicker value={currentDueDate} onChange={setCurrentDueDate} placeholder="Fecha límite" />
                      </div>
                    </div>

                    <Button size="sm" className="w-full" onClick={addToQueue}>
                      <Plus className="h-4 w-4 mr-1.5" />
                      Agregar a la lista
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-4 border-t shrink-0 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { reset(); setOpen(false) }}>
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={queue.length === 0 || loading}
              >
                {loading
                  ? "Asignando..."
                  : queue.length > 0
                    ? `Asignar ${queue.length} ejercicio${queue.length !== 1 ? "s" : ""}`
                    : "Agregá ejercicios"
                }
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
