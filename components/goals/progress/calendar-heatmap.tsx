"use client";

import { useMemo } from "react";
import type { CheckIn } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface CalendarHeatmapProps {
  checkIns: CheckIn[];
  weeks?: number;
  className?: string;
}

interface DayData {
  date: string;
  count: number;
  isToday: boolean;
  isFuture: boolean;
}

export function CalendarHeatmap({
  checkIns,
  weeks = 12,
  className,
}: Readonly<CalendarHeatmapProps>) {
  const { days, months } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count check-ins by date
    const checkInCounts = new Map<string, number>();
    for (const checkIn of checkIns) {
      const dateStr = new Date(checkIn.checked_at).toISOString().split("T")[0];
      checkInCounts.set(dateStr, (checkInCounts.get(dateStr) || 0) + 1);
    }

    // Generate days for the heatmap
    const daysArray: DayData[] = [];
    const totalDays = weeks * 7;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalDays + 1);

    // Adjust to start on Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    for (let i = 0; i < totalDays + 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      
      daysArray.push({
        date: dateStr,
        count: checkInCounts.get(dateStr) || 0,
        isToday: dateStr === today.toISOString().split("T")[0],
        isFuture: date > today,
      });
    }

    // Get unique months for labels
    const monthsMap = new Map<number, string>();
    for (const day of daysArray) {
      const date = new Date(day.date);
      const weekIndex = Math.floor(
        (new Date(day.date).getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      if (!monthsMap.has(weekIndex)) {
        const monthName = date.toLocaleDateString("en-US", { month: "short" });
        if (date.getDate() <= 7) {
          monthsMap.set(weekIndex, monthName);
        }
      }
    }

    return { days: daysArray, months: monthsMap };
  }, [checkIns, weeks]);

  // Group days by week (7 days per column)
  const weekColumns = useMemo(() => {
    const columns: DayData[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      columns.push(days.slice(i, i + 7));
    }
    return columns;
  }, [days]);

  const getIntensityClass = (count: number, isFuture: boolean, isToday: boolean) => {
    if (isFuture) return "bg-transparent";
    if (count === 0) return "bg-muted";
    if (count === 1) return "bg-green-200 dark:bg-green-900";
    if (count === 2) return "bg-green-400 dark:bg-green-700";
    return "bg-green-600 dark:bg-green-500";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Month labels */}
      <div className="flex gap-[3px] text-xs text-muted-foreground">
        <div className="w-[10px]" /> {/* Spacer for day labels */}
        {weekColumns.map((_, weekIndex) => (
          <div key={weekIndex} className="w-[12px] text-center">
            {months.get(weekIndex) || ""}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-[3px]">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] text-[10px] text-muted-foreground">
          <span className="h-[12px]" />
          <span className="h-[12px]">M</span>
          <span className="h-[12px]" />
          <span className="h-[12px]">W</span>
          <span className="h-[12px]" />
          <span className="h-[12px]">F</span>
          <span className="h-[12px]" />
        </div>

        {/* Week columns */}
        {weekColumns.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} check-in${day.count !== 1 ? "s" : ""}`}
                className={cn(
                  "h-[12px] w-[12px] rounded-sm transition-colors",
                  getIntensityClass(day.count, day.isFuture, day.isToday),
                  day.isToday && "ring-1 ring-primary ring-offset-1"
                )}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-[2px]">
          <div className="h-[10px] w-[10px] rounded-sm bg-muted" />
          <div className="h-[10px] w-[10px] rounded-sm bg-green-200 dark:bg-green-900" />
          <div className="h-[10px] w-[10px] rounded-sm bg-green-400 dark:bg-green-700" />
          <div className="h-[10px] w-[10px] rounded-sm bg-green-600 dark:bg-green-500" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
