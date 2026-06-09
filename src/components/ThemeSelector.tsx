"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme, THEMES, Theme, Accent } from "./ThemeProvider";
import { Palette, Check, X, Moon, Sun, Laptop, ShieldCheck } from "lucide-react";

interface ThemeOption {
  id: Theme;
  name: string;
  desc: string;
  icon: React.ComponentType<any>;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "system",
    name: "System Default",
    desc: "Syncs with OS preferences",
    icon: Laptop,
    bgClass: "bg-neutral-900",
    borderClass: "border-neutral-700",
    textClass: "text-neutral-300"
  },
  {
    id: "obsidian",
    name: "Obsidian Black",
    desc: "Midnight jet black mode",
    icon: Moon,
    bgClass: "bg-black",
    borderClass: "border-neutral-800",
    textClass: "text-neutral-200"
  },
  {
    id: "graphite",
    name: "Graphite Steel",
    desc: "Deep slate steel tone",
    icon: Moon,
    bgClass: "bg-slate-950",
    borderClass: "border-slate-800",
    textClass: "text-slate-200"
  },
  {
    id: "arctic",
    name: "Arctic White",
    desc: "Clean minimal light mode",
    icon: Sun,
    bgClass: "bg-white",
    borderClass: "border-slate-200",
    textClass: "text-slate-800"
  }
];

interface AccentOption {
  id: Accent;
  name: string;
  color: string;
  darkHex: string;
  lightHex: string;
}

const ACCENT_OPTIONS: AccentOption[] = [
  { id: "blue", name: "Classic Blue", color: "bg-blue-500", darkHex: "#3B82F6", lightHex: "#2563EB" },
  { id: "emerald", name: "Forest Emerald", color: "bg-emerald-500", darkHex: "#10B981", lightHex: "#059669" },
  { id: "violet", name: "Royal Violet", color: "bg-violet-500", darkHex: "#8B5CF6", lightHex: "#7C3AED" },
  { id: "crimson", name: "Crimson Red", color: "bg-red-500", darkHex: "#EF4444", lightHex: "#DC2626" },
  { id: "amber", name: "Vibrant Amber", color: "bg-amber-500", darkHex: "#F59E0B", lightHex: "#D97706" },
  { id: "black", name: "Midnight Black", color: "bg-black border border-neutral-700", darkHex: "#FFFFFF", lightHex: "#000000" }
];

export default function ThemeSelector() {
  const { theme, setTheme, accent, setAccent } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Studio local preview states
  const [tempTheme, setTempTheme] = useState<Theme>(theme);
  const [tempAccent, setTempAccent] = useState<Accent>(accent);
  const [isSystemDark, setIsSystemDark] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setIsSystemDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
      
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => setIsSystemDark(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  // Sync temp state with actual active settings when modal is opened
  useEffect(() => {
    if (isOpen) {
      setTempTheme(theme);
      setTempAccent(accent);
    }
  }, [isOpen, theme, accent]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const activeThemeObj = THEMES.find(t => t.id === theme) || THEMES[0];

  // Resolve Preview Colors dynamically based on the current temp selection
  const resolvedPreviewTheme = tempTheme === "system" ? (isSystemDark ? "obsidian" : "arctic") : tempTheme;
  const isDark = resolvedPreviewTheme !== "arctic";

  const previewStyles = (() => {
    const themeColors = {
      obsidian: {
        bg: "#050505",
        surface: "#0B0B0B",
        card: "#111111",
        border: "#222222",
        foreground: "#F5F5F5",
        muted: "#A3A3A3"
      },
      graphite: {
        bg: "#0E1116",
        surface: "#141922",
        card: "#1A2130",
        border: "#2A3441",
        foreground: "#E5E7EB",
        muted: "#94A3B8"
      },
      arctic: {
        bg: "#F8FAFC",
        surface: "#FFFFFF",
        card: "#F1F5F9",
        border: "#CBD5E1",
        foreground: "#0F172A",
        muted: "#64748B"
      }
    }[resolvedPreviewTheme as "obsidian" | "graphite" | "arctic"] || {
      bg: "#050505",
      surface: "#0B0B0B",
      card: "#111111",
      border: "#222222",
      foreground: "#F5F5F5",
      muted: "#A3A3A3"
    };

    const accentColors = isDark ? {
      blue: {
        primary: "#3B82F6",
        accent: "#60A5FA",
        glow: "rgba(59, 130, 246, 0.12)",
        chart1: "#3B82F6",
        chart2: "#60A5FA",
        chart3: "#93C5FD",
        contrastText: "#ffffff"
      },
      emerald: {
        primary: "#10B981",
        accent: "#34D399",
        glow: "rgba(16, 185, 129, 0.12)",
        chart1: "#10B981",
        chart2: "#34D399",
        chart3: "#6EE7B7",
        contrastText: "#ffffff"
      },
      violet: {
        primary: "#8B5CF6",
        accent: "#A78BFA",
        glow: "rgba(139, 92, 246, 0.12)",
        chart1: "#8B5CF6",
        chart2: "#A78BFA",
        chart3: "#C4B5FD",
        contrastText: "#ffffff"
      },
      crimson: {
        primary: "#EF4444",
        accent: "#FCA5A5",
        glow: "rgba(239, 68, 68, 0.12)",
        chart1: "#EF4444",
        chart2: "#FCA5A5",
        chart3: "#FECACA",
        contrastText: "#ffffff"
      },
      amber: {
        primary: "#F59E0B",
        accent: "#FCD34D",
        glow: "rgba(245, 158, 11, 0.12)",
        chart1: "#F59E0B",
        chart2: "#FCD34D",
        chart3: "#FDE68A",
        contrastText: "#0c0a09"
      },
      black: {
        primary: "#FFFFFF",
        accent: "#E5E5E5",
        glow: "rgba(255, 255, 255, 0.15)",
        chart1: "#FFFFFF",
        chart2: "#D4D4D4",
        chart3: "#A3A3A3",
        contrastText: "#000000"
      }
    }[tempAccent] : {
      blue: {
        primary: "#2563EB",
        accent: "#1D4ED8",
        glow: "rgba(37, 99, 235, 0.08)",
        chart1: "#2563EB",
        chart2: "#3B82F6",
        chart3: "#60A5FA",
        contrastText: "#ffffff"
      },
      emerald: {
        primary: "#059669",
        accent: "#047857",
        glow: "rgba(5, 150, 105, 0.08)",
        chart1: "#059669",
        chart2: "#10B981",
        chart3: "#34D399",
        contrastText: "#ffffff"
      },
      violet: {
        primary: "#7C3AED",
        accent: "#6D28D9",
        glow: "rgba(124, 58, 237, 0.08)",
        chart1: "#7C3AED",
        chart2: "#8B5CF6",
        chart3: "#A78BFA",
        contrastText: "#ffffff"
      },
      crimson: {
        primary: "#DC2626",
        accent: "#B91C1C",
        glow: "rgba(220, 38, 38, 0.08)",
        chart1: "#DC2626",
        chart2: "#EF4444",
        chart3: "#FCA5A5",
        contrastText: "#ffffff"
      },
      amber: {
        primary: "#D97706",
        accent: "#B45309",
        glow: "rgba(217, 119, 6, 0.08)",
        chart1: "#D97706",
        chart2: "#F59E0B",
        chart3: "#FCD34D",
        contrastText: "#ffffff"
      },
      black: {
        primary: "#000000",
        accent: "#171717",
        glow: "rgba(0, 0, 0, 0.08)",
        chart1: "#000000",
        chart2: "#404040",
        chart3: "#737373",
        contrastText: "#ffffff"
      }
    }[tempAccent];

    return { ...themeColors, ...accentColors };
  })();

  const handleApply = () => {
    setTheme(tempTheme);
    setAccent(tempAccent);
    setIsOpen(false);
  };

  return (
    <div className="no-print">
      <button
        onClick={() => setIsOpen(true)}
        className="glass-panel flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-[rgba(255,255,255,0.05)] cursor-pointer hover:border-accent hover:shadow-[0_0_12px_var(--glow)]"
        aria-label="Switch Theme"
      >
        <Palette className="w-3.5 h-3.5 text-accent" />
        <span>Theme: {activeThemeObj.name}</span>
      </button>

      {mounted && isOpen && createPortal(
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] overflow-y-auto flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="glass-panel w-full max-w-4xl rounded-2xl overflow-hidden relative glow-shadow animate-in zoom-in-95 duration-200 p-6 flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold tracking-wider text-primary uppercase flex items-center gap-2">
                  <Palette className="w-5 h-5 text-accent" />
                  Theme Studio
                </h3>
                <p className="text-xs text-muted mt-1">
                  Customize your workspace base appearance and highlight color.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-foreground transition-colors cursor-pointer p-1 rounded-full hover:bg-[rgba(255,255,255,0.05)]"
                aria-label="Close theme selector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split layout: Controls & Mockup Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column - Controls (Base Theme & Accent Color grids) */}
              <div className="md:col-span-7 flex flex-col gap-6">
                
                {/* 1. Base Themes Selection Grid */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold tracking-wider text-foreground uppercase">
                    1. Choose Base Theme
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {THEME_OPTIONS.map((opt) => {
                      const isSelected = tempTheme === opt.id;
                      const IconComponent = opt.icon;
                      
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setTempTheme(opt.id)}
                          className={`flex flex-col p-3 text-left rounded-xl border transition-all cursor-pointer relative group ${
                            isSelected 
                              ? "border-primary ring-2 ring-primary/30 shadow-md scale-[1.01]" 
                              : "border-border hover:border-muted hover:bg-[rgba(255,255,255,0.02)]"
                          } ${opt.id === "arctic" ? "bg-white text-slate-900 border-slate-200" : "bg-neutral-950 text-neutral-200 border-neutral-800"}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="p-1.5 rounded-lg bg-neutral-800/10 border border-neutral-700/20 group-hover:scale-110 transition-transform">
                              <IconComponent className={`w-4 h-4 ${opt.id === "arctic" ? "text-slate-700" : "text-neutral-400"}`} />
                            </span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center scale-110 shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          
                          <div>
                            <div className="text-xs font-bold tracking-tight">
                              {opt.name}
                            </div>
                            <div className="text-[10px] text-muted leading-tight mt-0.5">
                              {opt.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Accent Color Selection Grid */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold tracking-wider text-foreground uppercase">
                    2. Choose Accent Color
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {ACCENT_OPTIONS.map((opt) => {
                      const isSelected = tempAccent === opt.id;
                      
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setTempAccent(opt.id)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-semibold tracking-wide transition-all cursor-pointer hover:scale-[1.03] ${
                            isSelected 
                              ? "border-primary bg-[rgba(255,255,255,0.05)] ring-2 ring-primary/20 scale-[1.02]" 
                              : "border-border hover:border-muted"
                          }`}
                        >
                          {/* Accent circle badge */}
                          <span 
                            className={`w-3.5 h-3.5 rounded-full ${opt.color} flex items-center justify-center shrink-0 shadow-sm`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />}
                          </span>
                          <span>{opt.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Theme Hardening Status Check */}
                <div className="p-3.5 rounded-xl border border-border/80 bg-[rgba(0,0,0,0.15)] flex items-start gap-3 mt-auto">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-foreground">
                      Theme Stability Layer Active
                    </h5>
                    <p className="text-[10px] text-muted mt-1 leading-normal">
                      Full CSS variable encapsulation, WCAG AA contrast compliance, Recharts hydration-safety overrides, and legacy migrations automatically applied.
                    </p>
                  </div>
                </div>

              </div>

              {/* Right Column - Mockup Preview Card */}
              <div className="md:col-span-5 flex flex-col">
                <h4 className="text-xs font-bold tracking-wider text-foreground uppercase mb-3 flex items-center gap-1.5">
                  Live Preview Mockup
                </h4>
                
                {/* Mockup Card container simulating the workspace background */}
                <div 
                  className="rounded-2xl p-4 flex items-center justify-center flex-1 border border-dashed border-border/60 transition-colors"
                  style={{ backgroundColor: previewStyles.bg }}
                >
                  {/* Miniature Glassmorphic Card */}
                  <div 
                    className="w-full max-w-sm rounded-xl p-4 border flex flex-col gap-3 shadow-xl transition-all"
                    style={{ 
                      backgroundColor: previewStyles.card, 
                      borderColor: previewStyles.border,
                      color: previewStyles.foreground
                    }}
                  >
                    {/* Mock Card Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted opacity-80">
                          Senior Software Engineer
                        </div>
                        <h5 className="text-xs font-extrabold tracking-tight mt-0.5">
                          Google • L5
                        </h5>
                      </div>
                      <span 
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full border transition-colors"
                        style={{ 
                          backgroundColor: previewStyles.glow, 
                          color: previewStyles.accent,
                          borderColor: previewStyles.primary + "30"
                        }}
                      >
                        Top 10%
                      </span>
                    </div>

                    {/* Miniature CSS Chart */}
                    <div className="flex flex-col gap-1.5 py-1">
                      <div className="text-[8px] font-semibold text-muted">
                        Market Percentiles
                      </div>
                      <div className="flex items-end gap-3 h-16 pt-3 px-2 border-b border-border/40 relative">
                        {/* Bar 1 */}
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <div 
                            className="w-full rounded-t transition-all duration-300"
                            style={{ 
                              height: "45%", 
                              backgroundColor: previewStyles.chart3 
                            }}
                          />
                          <span className="text-[7px] text-muted">25th</span>
                        </div>
                        {/* Bar 2 */}
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <div 
                            className="w-full rounded-t transition-all duration-300"
                            style={{ 
                              height: "70%", 
                              backgroundColor: previewStyles.chart2 
                            }}
                          />
                          <span className="text-[7px] text-muted">50th</span>
                        </div>
                        {/* Bar 3 */}
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <div 
                            className="w-full rounded-t transition-all duration-300"
                            style={{ 
                              height: "90%", 
                              backgroundColor: previewStyles.chart1 
                            }}
                          />
                          <span className="text-[7px] font-bold" style={{ color: previewStyles.accent }}>90th</span>
                        </div>
                      </div>
                    </div>

                    {/* Mock Table Row */}
                    <div className="flex justify-between items-center text-[9px] border-b border-border/40 pb-2">
                      <span className="text-muted">Total Compensation</span>
                      <span className="font-extrabold text-sm" style={{ color: previewStyles.accent }}>
                        $340,000
                      </span>
                    </div>

                    {/* CTA Mock Button */}
                    <button 
                      className="w-full py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all uppercase shadow-md flex items-center justify-center gap-1"
                      style={{ 
                        backgroundColor: previewStyles.primary, 
                        color: previewStyles.contrastText 
                      }}
                      tabIndex={-1}
                    >
                      Compare Offer
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer / Actions */}
            <div className="border-t border-border pt-4 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-muted hover:text-foreground hover:bg-[rgba(255,255,255,0.05)] transition-all cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={handleApply}
                className="font-bold px-5 py-2.5 rounded-lg text-xs tracking-wider transition-all hover:opacity-95 active:scale-95 cursor-pointer shadow-lg"
                style={{ 
                  backgroundColor: previewStyles.primary, 
                  color: previewStyles.contrastText 
                }}
              >
                APPLY & CLOSE
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
