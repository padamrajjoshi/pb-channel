import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { DashboardWrapper } from "@/components/dashboard/DashboardWrapper";
import { ToastProvider } from "@/components/ui/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pebiglobe | Channel Manager",
  description: "Advanced bidirectional OTA synchronization and revenue optimization.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DashboardWrapper>
            <ToastProvider>
              {children}
            </ToastProvider>
          </DashboardWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
