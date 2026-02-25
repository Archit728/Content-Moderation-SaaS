// app/layout.tsx
import { Providers } from "@/components/Providers"; // <-- import wrapper
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ContentGuard - AI Content Moderation",
  description:
    "Enterprise-grade content moderation powered by AI. Detect and manage toxic content with real-time analytics and custom thresholds.",
  generator: "v0.app",
  keywords: ["content moderation", "ai", "toxicity detection", "saas"],
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  userScalable: true,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
  session, // optional if you use SSR sessions
}: {
  children: React.ReactNode;
  session?: any;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers session={session}>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
