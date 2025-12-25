import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/layout/page-transition";
import { getCheckIns } from "@/lib/actions/check-in-actions";
import { CheckInItem } from "@/components/goals/check-in-item";
import { CalendarHeatmap } from "@/components/goals/progress";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

interface CheckInsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CheckInsPage({
  params,
  searchParams,
}: Readonly<CheckInsPageProps>) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam || "1", 10));
  const limit = 20;

  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch goal to verify ownership and get title
  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("id, title, type")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (goalError || !goal) {
    notFound();
  }

  // Fetch check-ins with pagination
  const { checkIns, total } = await getCheckIns(id, page, limit);
  const totalPages = Math.ceil(total / limit);

  return (
    <PageTransition>
      <div className="mx-auto max-w-lg space-y-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            render={(props) => <Link href={`/goals/${id}`} {...props} />}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
            Back to Goal
          </Button>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold">Check-in History</h1>
          <p className="text-muted-foreground">{goal.title}</p>
        </div>

        {/* Heatmap for habits */}
        {goal.type === "habit" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarHeatmap checkIns={checkIns} />
            </CardContent>
          </Card>
        )}

        {/* Check-in List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              All Check-ins ({total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {checkIns.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>No check-ins yet.</p>
                <p className="mt-2 text-sm">
                  Start tracking your progress by adding check-ins!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {checkIns.map((checkIn) => (
                  <CheckInItem
                    key={checkIn.id}
                    checkIn={checkIn}
                    goalType={goal.type}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    render={(props) => (
                      <Link
                        href={`/goals/${id}/check-ins?page=${page - 1}`}
                        {...props}
                      />
                    )}
                  >
                    Previous
                  </Button>
                )}
                <span className="px-4 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Button
                    variant="outline"
                    size="sm"
                    render={(props) => (
                      <Link
                        href={`/goals/${id}/check-ins?page=${page + 1}`}
                        {...props}
                      />
                    )}
                  >
                    Next
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
