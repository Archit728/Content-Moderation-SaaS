// components/Providers.tsx
"use client"; // IMPORTANT: this makes it a Client Component

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { Toaster } from "sonner";

export function Providers({
  children,
  session,
}: {
  children: ReactNode;
  session?: any;
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
}
