import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { DashboardProviders } from "@/components/layout/dashboard-providers";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { UpdateNotification } from "@/components/pwa/update-notification";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <DashboardProviders>
      <div className="flex min-h-screen flex-col">
        <OfflineIndicator />
        <DashboardHeader
          user={{
            display_name: userData?.display_name || "User",
            avatar_url: userData?.avatar_url || null,
          }}
        />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20 sm:px-6 lg:px-8">
          {children}
        </main>
        <InstallPrompt />
        <UpdateNotification />
        <BottomNav />
      </div>
    </DashboardProviders>
  );
}
