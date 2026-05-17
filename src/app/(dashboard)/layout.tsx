"use client";

import React from "react";
import { DashboardWrapper } from "@/components/dashboard/DashboardWrapper";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardWrapper>
      {children}
    </DashboardWrapper>
  );
}
