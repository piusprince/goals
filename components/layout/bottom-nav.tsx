"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  UserGroupIcon,
  ArchiveIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

const navItems = [
  {
    name: "Home",
    href: "/dashboard",
    icon: Home01Icon,
  },
  {
    name: "Shared",
    href: "/shared",
    icon: UserGroupIcon,
  },
  {
    name: "Archive",
    href: "/archive",
    icon: ArchiveIcon,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: UserIcon,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <HugeiconsIcon icon={Icon} className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
