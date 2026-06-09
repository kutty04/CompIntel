"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "obsidian" | "graphite" | "arctic" | "system";
export type Accent = "blue" | "emerald" | "violet" | "crimson" | "amber" | "black";

interface ThemeContextType {
  theme: Theme;
  activeTheme: "obsidian" | "graphite" | "arctic";
  accent: Accent;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEMES: { id: Theme; name: string; class: string }[] = [
  { id: "system", name: "System Default", class: "bg-background text-foreground border-border" },
  { id: "obsidian", name: "Obsidian Black", class: "bg-[#050505] text-[#F5F5F5] border-[#202020]" },
  { id: "graphite", name: "Graphite Steel", class: "bg-[#0E1116] text-[#E5E7EB] border-[#2A3441]" },
  { id: "arctic", name: "Arctic White", class: "bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1]" }
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [accent, setAccentState] = useState<Accent>("blue");
  const [activeTheme, setActiveTheme] = useState<"obsidian" | "graphite" | "arctic">("obsidian");

  useEffect(() => {
    // 1. Theme Reading & Legacy Migration
    let savedTheme = localStorage.getItem("compintel-theme") as Theme | null;
    const migrations: Record<string, Theme> = {
      "midnight": "graphite",
      "emerald": "obsidian",
      "crimson": "obsidian",
      "nebula": "graphite",
      "arctic": "arctic",
      "obsidian": "obsidian"
    };

    if (savedTheme && migrations[savedTheme]) {
      savedTheme = migrations[savedTheme];
      localStorage.setItem("compintel-theme", savedTheme);
    }

    if (!savedTheme) {
      savedTheme = "system";
      localStorage.setItem("compintel-theme", "system");
    }

    setThemeState(savedTheme);

    // 2. Accent Reading
    const savedAccent = (localStorage.getItem("compintel-accent") as Accent) || "blue";
    setAccentState(savedAccent);

    // 3. Resolve Active Theme
    const resolveActiveTheme = (t: Theme): "obsidian" | "graphite" | "arctic" => {
      if (t === "system") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return isDark ? "obsidian" : "arctic";
      }
      return t as "obsidian" | "graphite" | "arctic";
    };

    const resolved = resolveActiveTheme(savedTheme);
    setActiveTheme(resolved);

    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.setAttribute("data-accent", savedAccent);

    // 4. Listen for System Preference Changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (localStorage.getItem("compintel-theme") === "system") {
        const isDark = mediaQuery.matches;
        const newResolved = isDark ? "obsidian" : "arctic";
        setActiveTheme(newResolved);
        document.documentElement.setAttribute("data-theme", newResolved);
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("compintel-theme", newTheme);
    
    const resolveActiveTheme = (t: Theme): "obsidian" | "graphite" | "arctic" => {
      if (t === "system") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return isDark ? "obsidian" : "arctic";
      }
      return t as "obsidian" | "graphite" | "arctic";
    };

    const resolved = resolveActiveTheme(newTheme);
    setActiveTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  };

  const setAccent = (newAccent: Accent) => {
    setAccentState(newAccent);
    localStorage.setItem("compintel-accent", newAccent);
    document.documentElement.setAttribute("data-accent", newAccent);
  };

  return (
    <ThemeContext.Provider value={{ theme, activeTheme, accent, setTheme, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}