"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step {
  label: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepClick: (index: number) => void
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep

        return (
          <div key={index} className="flex items-center gap-2 flex-1">
            <button
              type="button"
              onClick={() => {
                if (isCompleted) onStepClick(index)
              }}
              disabled={!isCompleted}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 w-full transition-colors text-left",
                isCurrent && "border-primary bg-primary/5",
                isCompleted && "border-muted-foreground/30 cursor-pointer hover:bg-muted",
                !isCurrent && !isCompleted && "border-muted opacity-50 cursor-not-allowed"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  isCurrent && "bg-primary text-primary-foreground",
                  isCompleted && "bg-primary/20 text-primary",
                  !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-sm font-medium truncate",
                  isCurrent && "text-foreground",
                  !isCurrent && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
