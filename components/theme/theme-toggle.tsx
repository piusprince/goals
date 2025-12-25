"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun01Icon, Moon01Icon } from "@hugeicons/core-free-icons";
import { useSyncExternalStore } from "react";

interface ThemeToggleProps {
  readonly className?: string;
  readonly variant?: "ghost" | "outline" | "default";
  readonly size?: "default" | "sm" | "lg" | "icon";
}

// Simple mounted check using useSyncExternalStore
function subscribe() {
  return () => {};
}
function getSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

export function ThemeToggle({
  className,
  variant = "ghost",
  size = "icon",
}: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  if (!mounted) {
    // Return placeholder with same size to avoid layout shift
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <HugeiconsIcon icon={Sun01Icon} className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <HugeiconsIcon icon={Sun01Icon} className="h-5 w-5" />
      ) : (
        <HugeiconsIcon icon={Moon01Icon} className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
