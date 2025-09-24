import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { TaskQueueProvider } from "@/contexts/TaskQueueContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scoreboard",
  description: "HZ 2025 Final",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TaskQueueProvider>
      <html lang="en">
        <body
          className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
        >
          <main className="min-h-screen bg-background">
            {children}
            <Analytics />
          </main>
        </body>
      </html>
    </TaskQueueProvider>
  );
}
