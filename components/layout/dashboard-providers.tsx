"use client";

import { ReactNode } from "react";
import { BadgeToastProvider } from "@/components/badges/badge-earned-toast";

interface DashboardProvidersProps {
  children: ReactNode;
}

export function DashboardProviders({ children }: DashboardProvidersProps) {
  return <BadgeToastProvider>{children}</BadgeToastProvider>;
}
