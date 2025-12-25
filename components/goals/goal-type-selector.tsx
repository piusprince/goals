"use client";

import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Target01Icon,
  RepeatIcon,
} from "@hugeicons/core-free-icons";

interface GoalTypeSelectorProps {
  value: "one-time" | "target" | "habit";
  onChange: (value: "one-time" | "target" | "habit") => void;
}

const types = [
  {
    value: "one-time" as const,
    label: "One-time",
    description: "Complete once",
    icon: CheckmarkCircle01Icon,
  },
  {
    value: "target" as const,
    label: "Target",
    description: "Track progress to a number",
    icon: Target01Icon,
  },
  {
    value: "habit" as const,
    label: "Habit",
    description: "Build a recurring habit",
    icon: RepeatIcon,
  },
];

export function GoalTypeSelector({ value, onChange }: Readonly<GoalTypeSelectorProps>) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {types.map((type) => {
        const isSelected = value === type.value;

        return (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-colors",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <HugeiconsIcon
              icon={type.icon}
              className={cn(
                "h-6 w-6",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}
            />
            <div>
              <div className="font-medium">{type.label}</div>
              <div className="text-xs text-muted-foreground">
                {type.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
