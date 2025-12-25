"use client";

import { type ReactNode } from "react";
import { BadgeToastProvider } from "@/components/badges/badge-earned-toast";

interface DashboardProvidersProps {
  readonly children: ReactNode;
}

export function DashboardProviders({ children }: DashboardProvidersProps) {
  return <BadgeToastProvider>{children}</BadgeToastProvider>;
}
