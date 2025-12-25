"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface DashboardHeaderProps {
  user: {
    display_name: string;
    avatar_url: string | null;
  };
}

export function DashboardHeader({ user }: Readonly<DashboardHeaderProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear =
    searchParams.get("year") || new Date().getFullYear().toString();

  // Generate year options (current year ± 2)
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => thisYear - 2 + i);

  const handleYearChange = (year: string | null) => {
    if (year) {
      router.push(`/dashboard?year=${year}`);
    }
  };

  const initials = user.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 sm:h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/dashboard"
            className="text-lg sm:text-xl font-bold text-primary"
          >
            Goals
          </Link>
          <Select value={currentYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-24 sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Link href="/profile">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all hover:ring-primary/40">
            <AvatarImage
              src={user.avatar_url || undefined}
              alt={user.display_name}
            />
            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
