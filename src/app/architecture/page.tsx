"use client";

import React from "react";
import { ArrowLeft, Cpu, Database, Layout, ShieldCheck, Terminal, Server, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ArchitecturePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-primary flex items-center gap-2">
          <Terminal className="w-6 h-6 text-primary" />
          Engineering Architecture Showcase
        </h1>
        <p className="text-xs text-accent mt-1">
          Deep-dive into the technical architecture, data flow, and design decisions powering the CompIntel platform.
        </p>
      </div>

      {/* SVG System Architecture Diagram */}
      <div className="glass-panel rounded-2xl p-6 glow-shadow space-y-4">
        <div>
          <h2 className="text-sm font-bold tracking-wider text-accent uppercase flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-primary" />
            System & Data Flow Topology
          </h2>
          <p className="text-xs text-accent mt-0.5">Interactive data routing mapping dual-mode database and caching services</p>
        </div>

        <div className="w-full overflow-x-auto py-2">
          <svg className="w-full min-w-[700px] h-[360px]" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" rx="16"/>

            {/* Connection lines */}
            <path d="M 150 200 L 270 200" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 410 200 L 530 200" stroke="var(--border)" strokeWidth="2" />
            
            {/* Split lines to DB / Mock */}
            <path d="M 670 200 L 710 120" stroke="var(--border)" strokeWidth="2" />
            <path d="M 670 200 L 710 280" stroke="var(--border)" strokeWidth="2" />
            
            {/* Client App */}
            <rect x="20" y="140" width="130" height="120" rx="12" fill="rgba(255,255,255,0.02)" stroke="var(--border)" strokeWidth="1.5" />
            <text x="85" y="175" fill="var(--primary)" fontSize="12" fontWeight="bold" textAnchor="middle">Next.js Frontend</text>
            <text x="85" y="195" fill="var(--accent)" fontSize="9" textAnchor="middle">React & Tailwind v4</text>
            <text x="85" y="215" fill="var(--accent)" fontSize="9" textAnchor="middle">TanStack Query & Recharts</text>
            <text x="85" y="235" fill="var(--accent)" fontSize="9" textAnchor="middle">Ctrl+K Palette & Themes</text>

            {/* API Gateway */}
            <rect x="270" y="140" width="140" height="120" rx="12" fill="rgba(255,255,255,0.02)" stroke="var(--border)" strokeWidth="1.5" />
            <text x="340" y="175" fill="var(--primary)" fontSize="12" fontWeight="bold" textAnchor="middle">API Routes & Auth</text>
            <text x="340" y="195" fill="var(--accent)" fontSize="9" textAnchor="middle">Server-Side Routing</text>
            <text x="340" y="215" fill="var(--accent)" fontSize="9" textAnchor="middle">NextAuth JWT Sessions</text>
            <text x="340" y="235" fill="var(--accent)" fontSize="9" textAnchor="middle">Zod Query Validation</text>

            {/* dataService repository */}
            <rect x="530" y="140" width="140" height="120" rx="12" fill="rgba(255,255,255,0.02)" stroke="var(--border)" strokeWidth="1.5" className="glow-shadow" />
            <text x="600" y="175" fill="var(--primary)" fontSize="12" fontWeight="bold" textAnchor="middle">dataService Layer</text>
            <text x="600" y="195" fill="var(--accent)" fontSize="9" textAnchor="middle">Resilience Connector</text>
            <text x="600" y="215" fill="var(--accent)" fontSize="9" textAnchor="middle">Dynamic Connection Check</text>
            <text x="600" y="235" fill="var(--accent)" fontSize="9" textAnchor="middle">Analytics & Trends Engine</text>

            {/* Prisma PostgreSQL */}
            <rect x="710" y="80" width="70" height="80" rx="8" fill="rgba(16,185,129,0.05)" stroke="rgba(16,185,129,0.25)" strokeWidth="1.5" />
            <text x="745" y="115" fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="middle">PostgreSQL</text>
            <text x="745" y="135" fill="var(--accent)" fontSize="8" textAnchor="middle">Prisma DB</text>

            {/* In-Memory database */}
            <rect x="710" y="240" width="70" height="80" rx="8" fill="rgba(59,130,246,0.05)" stroke="rgba(59,130,246,0.25)" strokeWidth="1.5" />
            <text x="745" y="275" fill="#60a5fa" fontSize="10" fontWeight="bold" textAnchor="middle">In-Memory</text>
            <text x="745" y="295" fill="var(--accent)" fontSize="8" textAnchor="middle">Fallback State</text>
          </svg>
        </div>
      </div>

      {/* Engineering details sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Frontend Architecture details */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 glow-shadow space-y-4">
          <h3 className="text-sm font-bold tracking-wider text-accent uppercase flex items-center gap-1.5">
            <Layout className="w-4 h-4 text-primary" />
            Frontend & Visual design
          </h3>
          <div className="space-y-3 text-xs text-accent leading-relaxed">
            <p>
              CompIntel leverages **Next.js 15 App Router** for layouts and server rendering optimization. Styling is handled via **TailwindCSS v4** with a custom CSS Custom Variables system in [globals.css](file:///c:/Users/R.Murugesan/.gemini/antigravity\playground\compintel\src\app\globals.css).
            </p>
            <p>
              **Visual Themes**: Six custom visual presets (Midnight, Emerald, Crimson, Nebula, Arctic, Obsidian) are dynamically managed via React Context and injected directly into the HTML element pre-render to avoid flash-of-unstyled-content (FOUC).
            </p>
            <p>
              **Data Visualization**: Stacked bar charts and timeline charts are built with Recharts, optimized for layout shifts and fluid responsive resizing.
            </p>
          </div>
        </div>

        {/* Backend & API Layer details */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 glow-shadow space-y-4">
          <h3 className="text-sm font-bold tracking-wider text-accent uppercase flex items-center gap-1.5">
            <Server className="w-4 h-4 text-primary" />
            Backend & API Contract Validation
          </h3>
          <div className="space-y-3 text-xs text-accent leading-relaxed">
            <p>
              The API layer uses Next.js Route Handlers with static/dynamic parameters. Query validation is enforced at the entry point using **Zod schemas** to ensure database safety.
            </p>
            <p>
              **Security & Authentication**: NextAuth credentials and Google OAuth providers generate stateless JWT tokens. Accounts are linked securely using normalized email parameters.
            </p>
            <p>
              **API Stats Caching**: Aggregated metadata averages are computed and cached in memory (30s TTL) at the server level, preventing database query thrashing during traffic spikes.
            </p>
          </div>
        </div>

        {/* Database design and Dual-Mode resilience */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 glow-shadow space-y-4">
          <h3 className="text-sm font-bold tracking-wider text-accent uppercase flex items-center gap-1.5">
            <Database className="w-4 h-4 text-primary" />
            Database Resilience Layer
          </h3>
          <div className="space-y-3 text-xs text-accent leading-relaxed">
            <p>
              The data repository ([dataService.ts](file:///c:/Users/R.Murugesan/.gemini\antigravity\playground\compintel\src\services\dataService.ts)) implements a **resilient connector pattern**. It attempts to establish a connection to Neon PostgreSQL via Prisma client, and immediately fails over to a synchronized In-Memory database state if the database is offline or parameters are missing.
            </p>
            <p>
              This architecture guarantees that the application compiles and runs immediately in local sandboxes without requiring external DB infrastructure, while remaining 100% production-ready.
            </p>
          </div>
        </div>

        {/* AI coprocessor and Analytics engine details */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 glow-shadow space-y-4">
          <h3 className="text-sm font-bold tracking-wider text-accent uppercase flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Insights & Analytics Coprocessor
          </h3>
          <div className="space-y-3 text-xs text-accent leading-relaxed">
            <p>
              The platform implements a standalone **Compensation Analytics Engine** ([analytics.ts](file:///c:/Users/R.Murugesan/.gemini\antigravity\playground\compintel\src\lib\analytics.ts)) computing mathematical percentiles (P25, P50, P75, P90) and dynamic market assessment deviations.
            </p>
            <p>
              **AI Briefings**: The insights panel queries LLM providers (OpenAI, Gemini, Claude) to translate salary distributions into executive briefs. If API credentials are not set, a **local rule-based statistical insights engine** compiles high-fidelity observations and negotiating advisories in real-time.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}