"use client"

import * as React from "react"
import { es } from "react-day-picker/locale"
import { CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function formatDisplay(date: Date): string {
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
}

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  label?: string
  optional?: boolean
  disablePast?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  disabled = false,
  disablePast = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selected = value ? new Date(value + "T00:00:00") : undefined
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maxDate = new Date(today.getFullYear() + 3, 11, 31)

  function handleSelect(date: Date | undefined) {
    if (!date) return
    onChange(toDateString(date))
    setOpen(false)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-9 px-3 gap-2",
            !selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate text-sm">
            {selected ? formatDisplay(selected) : placeholder}
          </span>
          {selected && (
            <span
              role="button"
              onClick={handleClear}
              className="shrink-0 rounded-sm hover:bg-accent p-0.5 -mr-1"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          disabled={disablePast ? { before: today } : undefined}
          defaultMonth={selected ?? today}
          startMonth={disablePast ? today : undefined}
          endMonth={maxDate}
          captionLayout="dropdown"
          locale={es}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
