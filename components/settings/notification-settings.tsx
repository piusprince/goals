"use client";

import { useState, useTransition, useEffect } from "react";
import { NotificationPreferences } from "@/lib/supabase/types";
import { updateNotificationPreferences } from "@/lib/actions/notification-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface NotificationSettingsProps {
  initialPreferences: NotificationPreferences;
}

export function NotificationSettings({ initialPreferences }: NotificationSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Track changes
  useEffect(() => {
    const changed =
      preferences.daily_reminders !== initialPreferences.daily_reminders ||
      preferences.reminder_time !== initialPreferences.reminder_time ||
      preferences.weekly_summary !== initialPreferences.weekly_summary ||
      preferences.achievement_alerts !== initialPreferences.achievement_alerts ||
      preferences.streak_warnings !== initialPreferences.streak_warnings;
    setHasChanges(changed);
  }, [preferences, initialPreferences]);

  const handleToggle = (field: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
    setSaveMessage(null);
  };

  const handleTimeChange = (time: string) => {
    // Convert HH:MM to HH:MM:SS format
    const timeWithSeconds = time + ":00";
    setPreferences((prev) => ({
      ...prev,
      reminder_time: timeWithSeconds,
    }));
    setSaveMessage(null);
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateNotificationPreferences({
        daily_reminders: preferences.daily_reminders,
        reminder_time: preferences.reminder_time,
        weekly_summary: preferences.weekly_summary,
        achievement_alerts: preferences.achievement_alerts,
        streak_warnings: preferences.streak_warnings,
      });

      if (result.success) {
        setSaveMessage({ type: "success", text: "Settings saved successfully!" });
        setHasChanges(false);
      } else {
        setSaveMessage({ type: "error", text: result.error || "Failed to save settings" });
      }
    });
  };

  // Convert HH:MM:SS to HH:MM for the time input
  const displayTime = preferences.reminder_time?.slice(0, 5) || "09:00";

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">Notification Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Choose what notifications you&apos;d like to receive
          </p>
        </div>

        {/* Daily Reminders */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="daily-reminders" className="text-base font-medium">
              Daily Check-in Reminders
            </Label>
            <p className="text-sm text-muted-foreground">
              Get a push notification to remind you to check in
            </p>
          </div>
          <ToggleSwitch
            id="daily-reminders"
            checked={preferences.daily_reminders}
            onChange={() => handleToggle("daily_reminders")}
          />
        </div>

        {/* Reminder Time */}
        {preferences.daily_reminders && (
          <div className="flex items-center justify-between ml-4 pl-4 border-l-2 border-muted">
            <div className="space-y-0.5">
              <Label htmlFor="reminder-time" className="text-sm font-medium">
                Reminder Time
              </Label>
              <p className="text-xs text-muted-foreground">
                When should we send your daily reminder?
              </p>
            </div>
            <Input
              id="reminder-time"
              type="time"
              value={displayTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-auto"
            />
          </div>
        )}

        {/* Weekly Summary */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="weekly-summary" className="text-base font-medium">
              Weekly Summary
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive a summary of your progress every Sunday
            </p>
          </div>
          <ToggleSwitch
            id="weekly-summary"
            checked={preferences.weekly_summary}
            onChange={() => handleToggle("weekly_summary")}
          />
        </div>

        {/* Achievement Alerts */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="achievement-alerts" className="text-base font-medium">
              Achievement Alerts
            </Label>
            <p className="text-sm text-muted-foreground">
              Get notified when you earn a new badge
            </p>
          </div>
          <ToggleSwitch
            id="achievement-alerts"
            checked={preferences.achievement_alerts}
            onChange={() => handleToggle("achievement_alerts")}
          />
        </div>

        {/* Streak Warnings */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="streak-warnings" className="text-base font-medium">
              Streak Warnings
            </Label>
            <p className="text-sm text-muted-foreground">
              Get warned when your streak is about to be lost
            </p>
          </div>
          <ToggleSwitch
            id="streak-warnings"
            checked={preferences.streak_warnings}
            onChange={() => handleToggle("streak_warnings")}
          />
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div
            className={`text-sm ${
              saveMessage.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={isPending || !hasChanges}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Simple toggle switch component
function ToggleSwitch({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${checked ? "bg-primary" : "bg-muted"}
      `}
    >
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
          transition duration-200 ease-in-out
          ${checked ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );
}
