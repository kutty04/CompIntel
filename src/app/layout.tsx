import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "../components/SessionProvider";
import QueryProvider from "../components/QueryProvider";
import { ThemeProvider } from "../components/ThemeProvider";
import Navbar from "../components/Navbar";
import CommandPalette from "../components/CommandPalette";

export const metadata: Metadata = {
  title: "CompIntel | Compensation Intelligence Platform",
  description: "Verify salaries, compare compensation levels, and inspect structured analytical trends across top companies.",
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let theme = localStorage.getItem("compintel-theme");
                let accent = localStorage.getItem("compintel-accent") || "blue";
                
                const migrations = {
                  "midnight": "graphite",
                  "emerald": "obsidian",
                  "crimson": "obsidian",
                  "nebula": "graphite",
                  "arctic": "arctic",
                  "obsidian": "obsidian"
                };
                
                if (theme && migrations[theme]) {
                  theme = migrations[theme];
                  localStorage.setItem("compintel-theme", theme);
                }
                
                if (!theme || theme === "system") {
                  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  theme = isDark ? "obsidian" : "arctic";
                }
                
                document.documentElement.setAttribute("data-theme", theme);
                document.documentElement.setAttribute("data-accent", accent);
              } catch (e) {}
            `
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider>
              <Navbar />
              <CommandPalette />
              <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
              <footer className="border-t border-border mt-auto py-6 bg-[rgba(var(--background),0.2)] no-print">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-accent">
                    Ac 2026 CompIntel. Built for verified compensation transparency.
                  </div>
                  <div className="flex items-center gap-4 text-xs text-accent">
                    <a href="/research" className="hover:text-primary transition-colors">Research comparison</a>
                    <span>•</span>
                    <span>LEVELS MATTER MORE THAN JOB TITLES</span>
                  </div>
                </div>
              </footer>
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}