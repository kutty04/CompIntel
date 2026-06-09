"use client";

import React from "react";
import { Terminal, Scale, Calculator, Trophy, ShieldCheck, Palette, FileText, ArrowRight, Play } from "lucide-react";
import Link from "next/link";

interface Scenario {
  title: string;
  description: string;
  badge: string;
  icon: any;
  href: string;
  ctaText: string;
}

export default function DemoHubPage() {
  const scenarios: Scenario[] = [
    {
      title: "Diagnostic Pay Check (Am I Underpaid?)",
      description: "Launches the diagnostic compensation calculator pre-filled for a candidate at Google SDE L4 earning $80k. Simulates calculations of percentile standing, market deviation, and negotiation advisory briefings.",
      badge: "AI Insights",
      icon: Calculator,
      href: "/insights?company=Google&role=Software%20Engineer&level=L4&location=Bangalore&comp=80000",
      ctaText: "Simulate underpaid check"
    },
    {
      title: "Side-by-SideStacked Comp Compare",
      description: "Opens the comparison matrix pre-filled with Google L4 vs Meta L4 side-by-side. Reviews base cash, bonus, and stock splits in high-contrast stacked charts ready for printing.",
      badge: "Analytics Visualizer",
      icon: Scale,
      href: "/compare?c1=Google&l1=L4&c2=Meta&l2=L4",
      ctaText: "Launch side-by-side compare"
    },
    {
      title: "Interactive Explorer & Search",
      description: "Directs to the salary search engine pre-filtered for Software Engineer roles in Bangalore. Reviews pagination, multi-column sorting, and company details profiles.",
      badge: "Search & Filtering",
      icon: Terminal,
      href: "/salaries?role=Software+Engineer&location=Bangalore",
      ctaText: "Explore salaries database"
    },
    {
      title: "Compensation leaderboards",
      description: "Launches leaderboards computing top-paying companies, regions, and roles dynamically calculated against platform medians.",
      badge: "Rankings",
      icon: Trophy,
      href: "/rankings",
      ctaText: "View leaderboards"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center py-6 border-b border-border/40">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> RECRUITER DEMO MODE
        </div>
        <h1 className="text-3xl font-black tracking-tight text-primary leading-tight">
          Reviewer Walkthrough & Guided Tour
        </h1>
        <p className="text-xs text-accent max-w-lg mx-auto mt-2 leading-relaxed">
          Welcome to the CompIntel reviewer dashboard. We have compiled pre-filled workflows and scenarios showcasing the platform's core capabilities.
        </p>
      </div>

      {/* Guided Scenarios Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold tracking-wider text-accent uppercase">Select Guided Scenario</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map((scen, idx) => {
            const Icon = scen.icon;
            return (
              <div key={idx} className="glass-panel rounded-2xl p-5 glow-shadow flex flex-col justify-between space-y-4 hover:border-accent transition-all relative overflow-hidden group">
                <span className="absolute top-4 right-4 text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-widest bg-[rgba(255,255,255,0.03)] text-accent border border-border/20 uppercase">
                  {scen.badge}
                </span>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[rgba(255,255,255,0.02)] border border-border/40 rounded-lg text-primary">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-primary">{scen.title}</h3>
                  </div>
                  <p className="text-[11px] text-accent leading-relaxed">
                    {scen.description}
                  </p>
                </div>

                <Link
                  href={scen.href}
                  className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-lg text-[10px] tracking-wider transition-all hover:opacity-90 active:scale-98 flex items-center justify-center gap-1.5 group-hover:shadow-glow cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-primary-foreground text-primary-foreground" />
                  {scen.ctaText.toUpperCase()}
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Highlights Showcase */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 glow-shadow space-y-4">
        <h2 className="text-xs font-bold tracking-wider text-accent uppercase">Architectural Excellence Checklist</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Item 1 */}
          <div className="p-4 rounded-xl border border-border/40 bg-[rgba(255,255,255,0.01)] space-y-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <h4 className="text-[10px] font-bold text-primary uppercase">Resilient Database</h4>
            </div>
            <p className="text-[10px] text-accent leading-relaxed">
              If Neon PostgreSQL database credentials are offline, the system fells over seamlessly to an In-Memory data repository seeded with 128 items. Try searching, compare, or submitting salaries anonymously!
            </p>
          </div>
          {/* Item 2 */}
          <div className="p-4 rounded-xl border border-border/40 bg-[rgba(255,255,255,0.01)] space-y-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <h4 className="text-[10px] font-bold text-primary uppercase">Executive Theme system</h4>
            </div>
            <p className="text-[10px] text-accent leading-relaxed">
              Click the "Theme" switcher in the header to open the Visual Gallery Modal. Preview visual mock presets matching Midnight Blue, Emerald, Crimson, and Purple Nebula themes.
            </p>
          </div>
          {/* Item 3 */}
          <div className="p-4 rounded-xl border border-border/40 bg-[rgba(255,255,255,0.01)] space-y-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <h4 className="text-[10px] font-bold text-primary uppercase">Smart Search Keyboard</h4>
            </div>
            <p className="text-[10px] text-accent leading-relaxed">
              Press <kbd className="bg-[rgba(255,255,255,0.05)] border border-border/40 px-1 py-0.5 rounded text-[8px] font-mono text-accent">Ctrl+K</kbd> anywhere on the site to trigger the search command palette. Fuzzy match nav links and company dashboards instantly.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}