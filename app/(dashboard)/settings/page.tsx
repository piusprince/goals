import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getNotificationPreferences } from "@/lib/actions/notification-actions";
import { NotificationSettings } from "@/components/settings/notification-settings";

export const metadata = {
  title: "Settings | Goals",
  description: "Manage your notification and account settings",
};

export default async function SettingsPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const prefsResult = await getNotificationPreferences();

  if (!prefsResult.success || !prefsResult.data) {
    throw new Error(
      prefsResult.error || "Failed to load notification preferences"
    );
  }

  return (
    <div className="container max-w-2xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your notification preferences and account settings
        </p>
      </div>

      <div className="space-y-6">
        <NotificationSettings initialPreferences={prefsResult.data} />

        {/* Future: Add more settings sections here */}
        {/* <AccountSettings /> */}
        {/* <PrivacySettings /> */}
      </div>
    </div>
  );
}
