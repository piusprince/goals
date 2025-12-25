"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/layout/page-transition";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CheckmarkSquare02Icon,
  Target01Icon,
  FireIcon,
  Award01Icon,
  Calendar01Icon,
  CrownIcon,
} from "@hugeicons/core-free-icons";
import {
  getWeeklySummary,
  type WeeklySummary,
} from "@/lib/actions/insights-actions";

function formatDateRange(startDate: Date, endDate: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const startStr = startDate.toLocaleDateString("en-US", options);
  const endStr = endDate.toLocaleDateString("en-US", options);
  return `${startStr} - ${endStr}`;
}

function getWeekStartDate(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

interface StatCardProps {
  icon: typeof CheckmarkSquare02Icon;
  label: string;
  value: string | number;
  subtitle?: string;
  iconColor?: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  iconColor,
}: Readonly<StatCardProps>) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            iconColor || "bg-primary/10 text-primary"
          )}
        >
          <HugeiconsIcon icon={Icon} className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SummaryPage() {
  const [weekStart, setWeekStart] = useState<Date>(() =>
    getWeekStartDate(new Date())
  );
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const isCurrentWeek =
    getWeekStartDate(new Date()).getTime() === weekStart.getTime();

  const navigateWeek = useCallback((direction: "prev" | "next") => {
    setWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
      return newDate;
    });
  }, []);

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      setError(null);
      const result = await getWeeklySummary(weekStart);
      if (result.success && result.data) {
        setSummary(result.data);
      } else {
        setError(result.error || "Failed to load summary");
      }
      setLoading(false);
    }
    fetchSummary();
  }, [weekStart]);

  return (
    <PageTransition>
      <div className="py-6">
        {/* Header with Week Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold sm:text-2xl">Weekly Summary</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateWeek("prev")}
              aria-label="Previous week"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
            </Button>
            <div className="min-w-[140px] text-center">
              <span className="text-sm font-medium">
                {formatDateRange(weekStart, weekEnd)}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateWeek("next")}
              disabled={isCurrentWeek}
              aria-label="Next week"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {error && (
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && summary && (
          <>
            {/* Summary Stats Grid */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={CheckmarkSquare02Icon}
                label="Total Check-ins"
                value={summary.totalCheckIns}
                iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              />
              <StatCard
                icon={Target01Icon}
                label="Goals Completed"
                value={summary.goalsCompleted}
                iconColor="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              />
              <StatCard
                icon={FireIcon}
                label="Longest Streak"
                value={summary.longestStreak?.streak || 0}
                subtitle={summary.longestStreak?.goalTitle}
                iconColor="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
              />
              <StatCard
                icon={Calendar01Icon}
                label="Active Goals"
                value={summary.activeGoals}
                iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
              />
            </div>

            {/* Top Goal Highlight */}
            {summary.topGoal && (
              <Card className="mb-6 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                    <HugeiconsIcon icon={Award01Icon} className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Most Active Goal
                    </p>
                    <p className="font-semibold">{summary.topGoal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {summary.topGoal.checkIns} check-in
                      {summary.topGoal.checkIns !== 1 ? "s" : ""} this week
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            {summary.achievements.length > 0 && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <HugeiconsIcon
                      icon={CrownIcon}
                      className="h-5 w-5 text-primary"
                    />
                    Achievements Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {summary.achievements.map((achievement) => (
                      <span
                        key={achievement}
                        className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                      >
                        🏆 {achievement}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Goal-by-Goal Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Goal Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {summary.goalBreakdown.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No goals to display</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {summary.goalBreakdown.map((goal) => (
                      <div
                        key={goal.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{goal.title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="capitalize">{goal.category}</span>
                            <span>•</span>
                            <span className="capitalize">{goal.type}</span>
                            {goal.type === "habit" &&
                              goal.currentStreak > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                    <HugeiconsIcon
                                      icon={FireIcon}
                                      className="h-3 w-3"
                                    />
                                    {goal.currentStreak} day streak
                                  </span>
                                </>
                              )}
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col items-end">
                          <span className="text-lg font-semibold">
                            {goal.checkIns}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            check-in{goal.checkIns !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Empty State */}
            {summary.totalCheckIns === 0 && (
              <div className="mt-6 rounded-lg border border-dashed p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <HugeiconsIcon
                    icon={Calendar01Icon}
                    className="h-8 w-8 text-muted-foreground"
                  />
                </div>
                <h3 className="mb-2 font-semibold">No Activity This Week</h3>
                <p className="text-sm text-muted-foreground">
                  Start checking in on your goals to see your progress here!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
