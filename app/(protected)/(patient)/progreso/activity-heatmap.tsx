"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

const MONTHS_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
const DAYS_ES = ["L", "M", "X", "J", "V", "S", "D"]
const CELL = 11
const GAP = 2
const STEP = CELL + GAP

interface Cell {
  dateStr: string
  count: number
  isFuture: boolean
}

interface MonthLabel {
  weekIndex: number
  label: string
}

function cellStyle(count: number, isFuture: boolean): React.CSSProperties {
  if (isFuture || count === 0) return {}
  const opacity = count === 1 ? 0.28 : count === 2 ? 0.52 : count === 3 ? 0.78 : 1
  return { background: `rgba(87,159,147,${opacity})` }
}

export function ActivityHeatmap({ activityMap }: { activityMap: Record<string, number> }) {
  const { weeks, monthLabels, totalSessions } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dow = today.getDay()
    const daysFromMonday = dow === 0 ? 6 : dow - 1
    const thisMonday = new Date(today)
    thisMonday.setDate(today.getDate() - daysFromMonday)

    const startDate = new Date(thisMonday)
    startDate.setDate(startDate.getDate() - 52 * 7)

    const weeks: Cell[][] = []
    const monthLabels: MonthLabel[] = []
    let prevMonth = -1
    let d = new Date(startDate)

    for (let w = 0; w < 53; w++) {
      const week: Cell[] = []
      for (let day = 0; day < 7; day++) {
        const dateStr = d.toISOString().slice(0, 10)
        const isFuture = d > today
        if (day === 0) {
          const m = d.getMonth()
          if (m !== prevMonth) {
            monthLabels.push({ weekIndex: w, label: MONTHS_ES[m] })
            prevMonth = m
          }
        }
        week.push({ dateStr, count: isFuture ? 0 : (activityMap[dateStr] ?? 0), isFuture })
        d.setDate(d.getDate() + 1)
      }
      weeks.push(week)
    }

    const totalSessions = Object.values(activityMap).reduce((a, b) => a + b, 0)
    return { weeks, monthLabels, totalSessions }
  }, [activityMap])

  const gridWidth = weeks.length * STEP - GAP

  return (
    <div className="rounded-2xl bg-muted/40 dark:bg-stone-800/60 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Actividad del año
        </span>
        <span className="text-xs text-muted-foreground">{totalSessions} ejercicio{totalSessions !== 1 ? "s" : ""} completado{totalSessions !== 1 ? "s" : ""}</span>
      </div>

      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <div className="flex gap-2 items-start">
          <div className="flex flex-col shrink-0" style={{ marginTop: 20, gap: GAP }}>
            {DAYS_ES.map((d, i) => (
              <div
                key={d}
                className="text-[9px] font-medium text-muted-foreground flex items-center justify-end pr-1"
                style={{ height: CELL, visibility: i % 2 === 1 ? "visible" : "hidden" }}
              >
                {d}
              </div>
            ))}
          </div>

          <div style={{ width: gridWidth, flexShrink: 0 }}>
            <div className="relative h-5 mb-0.5" style={{ width: gridWidth }}>
              {monthLabels.map(({ weekIndex, label }, i) => {
                const nextWeekIndex = monthLabels[i + 1]?.weekIndex ?? weeks.length
                const spanPx = (nextWeekIndex - weekIndex) * STEP
                return (
                  <span
                    key={weekIndex}
                    className="absolute text-[9px] font-medium text-muted-foreground overflow-hidden whitespace-nowrap"
                    style={{ left: weekIndex * STEP, width: spanPx, top: 4 }}
                  >
                    {label}
                  </span>
                )
              })}
            </div>

            <div className="flex" style={{ gap: GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                  {week.map((cell) => (
                    <div
                      key={cell.dateStr}
                      title={
                        cell.isFuture
                          ? undefined
                          : cell.count === 0
                          ? `${cell.dateStr}: sin actividad`
                          : `${cell.dateStr}: ${cell.count} ejercicio${cell.count > 1 ? "s" : ""} completado${cell.count > 1 ? "s" : ""}`
                      }
                      className={cn(
                        "rounded-[2px]",
                        cell.isFuture
                          ? "opacity-0 pointer-events-none"
                          : cell.count === 0
                          ? "bg-stone-100 dark:bg-stone-700"
                          : "cursor-pointer hover:opacity-80 transition-opacity"
                      )}
                      style={{ width: CELL, height: CELL, ...cellStyle(cell.count, cell.isFuture) }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 justify-end pt-0.5">
        <span className="text-[10px] text-muted-foreground">Menos</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn("rounded-[2px]", level === 0 ? "bg-stone-100 dark:bg-stone-700" : "")}
            style={{
              width: 10,
              height: 10,
              ...(level > 0 ? cellStyle(level, false) : {}),
            }}
          />
        ))}
        <span className="text-[10px] text-muted-foreground">Más</span>
      </div>
    </div>
  )
}
