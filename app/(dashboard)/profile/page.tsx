import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/profile-form";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/profile-actions";
import { Separator } from "@/components/ui/separator";
import { PageTransition } from "@/components/layout/page-transition";
import { getAllBadges, getUserBadges } from "@/lib/actions/badge-actions";
import { BadgeGrid } from "@/components/badges/badge-grid";

export default async function ProfilePage() {
  const supabase = await createServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!user) {
    redirect("/login");
  }

  // Fetch badges data
  const [allBadgesResult, userBadgesResult] = await Promise.all([
    getAllBadges(),
    getUserBadges(),
  ]);

  const allBadges = allBadgesResult.data ?? [];
  const userBadges = userBadgesResult.data ?? [];
  const earnedCount = userBadges.length;
  const totalCount = allBadges.length;

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
          Profile Settings
        </h1>

        <div className="space-y-4 sm:space-y-6">
          {/* Badges Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Achievements</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {earnedCount} / {totalCount} earned
                </span>
              </CardTitle>
              <CardDescription>
                Badges you&apos;ve earned on your goal journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allBadges.length > 0 ? (
                <BadgeGrid
                  badges={allBadges}
                  earnedBadges={userBadges}
                  columns={4}
                  className="sm:grid-cols-5"
                />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No badges available yet. Keep working on your goals!
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Upload a profile picture to personalize your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AvatarUpload
                currentAvatarUrl={user.avatar_url}
                displayName={user.display_name}
                userId={user.id}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your display name and other profile details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm user={user} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {authUser.email}
                  </p>
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <Link href="/settings">
                    <Button variant="outline" className="w-full">
                      Notification Settings
                    </Button>
                  </Link>
                </div>

                <Separator />

                <form action={signOut}>
                  <Button type="submit" variant="destructive">
                    Log Out
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
