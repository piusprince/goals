"use client";

import { useMemo } from "react";
import type { CheckIn } from "@/lib/supabase/types";
import { CalendarHeatmap } from "./calendar-heatmap";
import { cn } from "@/lib/utils";

interface ProgressChartProps {
  goalType: "target" | "habit";
  checkIns: CheckIn[];
  targetValue?: number | null;
  className?: string;
}

export function ProgressChart({
  goalType,
  checkIns,
  targetValue,
  className,
}: Readonly<ProgressChartProps>) {
  // For habit goals, show calendar heatmap
  if (goalType === "habit") {
    return <CalendarHeatmap checkIns={checkIns} weeks={12} className={className} />;
  }

  // For target goals, show a simple line chart using SVG
  return (
    <TargetProgressChart
      checkIns={checkIns}
      targetValue={targetValue || 100}
      className={className}
    />
  );
}

interface TargetProgressChartProps {
  checkIns: CheckIn[];
  targetValue: number;
  className?: string;
}

function TargetProgressChart({
  checkIns,
  targetValue,
  className,
}: Readonly<TargetProgressChartProps>) {
  const chartData = useMemo(() => {
    if (checkIns.length === 0) return [];

    // Sort check-ins by date
    const sorted = [...checkIns].sort(
      (a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime()
    );

    // Calculate cumulative progress
    let cumulative = 0;
    const data = sorted.map((checkIn) => {
      cumulative += checkIn.value;
      return {
        date: new Date(checkIn.checked_at),
        value: cumulative,
        checkIn,
      };
    });

    return data;
  }, [checkIns]);

  if (chartData.length === 0) {
    return (
      <div className={cn("flex h-32 items-center justify-center", className)}>
        <p className="text-sm text-muted-foreground">
          No progress data yet. Add your first check-in!
        </p>
      </div>
    );
  }

  // SVG dimensions
  const width = 320;
  const height = 160;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const maxValue = Math.max(targetValue, ...chartData.map((d) => d.value));
  const minDate = chartData[0].date.getTime();
  const maxDate = chartData[chartData.length - 1].date.getTime();
  const dateRange = maxDate - minDate || 1;

  const scaleX = (date: Date) =>
    padding.left + ((date.getTime() - minDate) / dateRange) * chartWidth;
  const scaleY = (value: number) =>
    padding.top + chartHeight - (value / maxValue) * chartHeight;

  // Generate path
  const pathD = chartData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(d.date)} ${scaleY(d.value)}`)
    .join(" ");

  // Target line Y position
  const targetY = scaleY(targetValue);

  return (
    <div className={cn("overflow-x-auto", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[280px]"
        role="img"
        aria-label="Progress chart"
      >
        {/* Grid lines */}
        <g stroke="currentColor" strokeOpacity={0.1}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={padding.left}
              y1={padding.top + chartHeight * (1 - ratio)}
              x2={width - padding.right}
              y2={padding.top + chartHeight * (1 - ratio)}
            />
          ))}
        </g>

        {/* Target line */}
        <line
          x1={padding.left}
          y1={targetY}
          x2={width - padding.right}
          y2={targetY}
          stroke="hsl(var(--primary))"
          strokeDasharray="4 4"
          strokeOpacity={0.5}
        />
        <text
          x={width - padding.right + 4}
          y={targetY}
          fontSize={10}
          fill="hsl(var(--primary))"
          dominantBaseline="middle"
        >
          Goal
        </text>

        {/* Progress line */}
        <path
          d={pathD}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {chartData.map((d, i) => (
          <circle
            key={i}
            cx={scaleX(d.date)}
            cy={scaleY(d.value)}
            r={4}
            fill="hsl(var(--background))"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
          />
        ))}

        {/* Y-axis labels */}
        <text
          x={padding.left - 8}
          y={padding.top}
          fontSize={10}
          fill="currentColor"
          textAnchor="end"
          dominantBaseline="middle"
          opacity={0.6}
        >
          {maxValue}
        </text>
        <text
          x={padding.left - 8}
          y={padding.top + chartHeight}
          fontSize={10}
          fill="currentColor"
          textAnchor="end"
          dominantBaseline="middle"
          opacity={0.6}
        >
          0
        </text>

        {/* X-axis labels */}
        <text
          x={padding.left}
          y={height - 8}
          fontSize={10}
          fill="currentColor"
          textAnchor="start"
          opacity={0.6}
        >
          {chartData[0].date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </text>
        <text
          x={width - padding.right}
          y={height - 8}
          fontSize={10}
          fill="currentColor"
          textAnchor="end"
          opacity={0.6}
        >
          {chartData[chartData.length - 1].date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </text>
      </svg>
    </div>
  );
}
