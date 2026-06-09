import React from "react";
import { Check, X, Shield, BarChart3, HelpCircle } from "lucide-react";

export const metadata = {
  title: "CompIntel | Platform Research & Feature Matrix",
  description: "Comparison matrix showing compensation intelligence features across industry standard applications."
};

interface MatrixRow {
  feature: string;
  levelsFyi: boolean | string;
  sixFigr: boolean | string;
  ambitionBox: boolean | string;
  glassdoor: boolean | string;
  build: boolean | string;
}

export default function ResearchPage() {
  const matrix: MatrixRow[] = [
    {
      feature: "Salary comparison",
      levelsFyi: true,
      sixFigr: true,
      ambitionBox: true,
      glassdoor: true,
      build: "YES (Dynamic Side-by-Side)"
    },
    {
      feature: "Company pages",
      levelsFyi: true,
      sixFigr: "Limited",
      ambitionBox: true,
      glassdoor: true,
      build: "YES (Profile & Distribution Stats)"
    },
    {
      feature: "Compensation breakdown",
      levelsFyi: "YES (Base/Bonus/Stock)",
      sixFigr: "Limited",
      ambitionBox: "NO (Mostly Cash)",
      glassdoor: "NO (Total Cash Range)",
      build: "YES (Detailed Component vesting)"
    },
    {
      feature: "Level-based comparison",
      levelsFyi: "YES (Key Normalization)",
      sixFigr: "NO (Job titles only)",
      ambitionBox: "NO (Averages only)",
      glassdoor: "NO (Ad-hoc Titles)",
      build: "YES (Normalized Level Mapping)"
    },
    {
      feature: "Advanced Filters",
      levelsFyi: true,
      sixFigr: "Limited",
      ambitionBox: "Basic",
      glassdoor: "Basic",
      build: "YES (Level/Location/Role/Company)"
    },
    {
      feature: "Saved comparisons",
      levelsFyi: true,
      sixFigr: false,
      ambitionBox: false,
      glassdoor: false,
      build: "YES (Authenticated Dashboard)"
    },
    {
      feature: "Salary submission verification",
      levelsFyi: "Manual Review",
      sixFigr: false,
      ambitionBox: "Self-Reported",
      glassdoor: "Self-Reported",
      build: "YES (Session Authenticated)"
    }
  ];

  const renderCell = (val: boolean | string) => {
    if (typeof val === "string") {
      return (
        <div className="flex items-center gap-1.5 justify-center sm:justify-start">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{val}</span>
        </div>
      );
    }
    return val ? (
      <div className="flex justify-center sm:justify-start">
        <Check className="w-4 h-4 text-emerald-400" />
      </div>
    ) : (
      <div className="flex justify-center sm:justify-start">
        <X className="w-4 h-4 text-red-400" />
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-primary flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Platform Research & Analysis
        </h1>
        <p className="text-xs text-accent mt-1">
          Competitive analysis matrix evaluating CompIntel features against current industry standards.
        </p>
      </div>

      {/* Research Table Card */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 glow-shadow">
        <h2 className="text-sm font-bold tracking-wider text-accent uppercase border-b border-border pb-3 mb-4">
          Market Comparison Matrix
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold text-accent uppercase tracking-wider">
                <th className="py-3 px-3">Feature</th>
                <th className="py-3 px-3 text-center sm:text-left">Levels.fyi</th>
                <th className="py-3 px-3 text-center sm:text-left">6figr</th>
                <th className="py-3 px-3 text-center sm:text-left">AmbitionBox</th>
                <th className="py-3 px-3 text-center sm:text-left">Glassdoor</th>
                <th className="py-3 px-3 text-center sm:text-left text-primary">CompIntel (Build?)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs">
              {matrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                  <td className="py-4 px-3 font-semibold text-primary">{row.feature}</td>
                  <td className="py-4 px-3 text-accent">{renderCell(row.levelsFyi)}</td>
                  <td className="py-4 px-3 text-accent">{renderCell(row.sixFigr)}</td>
                  <td className="py-4 px-3 text-accent">{renderCell(row.ambitionBox)}</td>
                  <td className="py-4 px-3 text-accent">{renderCell(row.glassdoor)}</td>
                  <td className="py-4 px-3 text-primary bg-[rgba(255,255,255,0.01)]">{renderCell(row.build)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rationale & System Design Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="glass-panel rounded-2xl p-5 sm:p-6 glow-shadow space-y-3">
          <h3 className="text-sm font-bold tracking-wider text-accent uppercase flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Why Leveled Normalization Matters
          </h3>
          <div className="text-xs text-accent leading-relaxed space-y-3">
            <p>
              In modern technology organizations, job titles are notoriously loose and misaligned. A "Senior Software Engineer" at a startup might represent an entry-level L3/L4 equivalent skill level at Google or Meta, while a "Software Engineer II" at one company might match a Staff L6 salary grade elsewhere.
            </p>
            <p>
              <strong>CompIntel</strong> adopts a structured leveling framework inspired by Levels.fyi. By mapping all salary entries to normalized bands (L3, L4, L5, L6), the platform enables mathematically sound side-by-side compensation reviews, ensuring you compare apples to apples.
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 sm:p-6 glow-shadow space-y-3">
          <h3 className="text-sm font-bold tracking-wider text-accent uppercase flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            Key Design Pillars of CompIntel
          </h3>
          <ul className="text-xs text-accent space-y-2.5 list-disc pl-4">
            <li>
              <strong>Structured Compensation Splitting</strong>: Separates cash base salary, annual performance bonuses, and stock/equity vesting schedules.
            </li>
            <li>
              <strong>Company Name Suffix Pruning</strong>: Automatically normalizes messy inputs like "Google India Private Ltd" or "Google LLC" into clean "Google" keys to ensure aggregation accuracy.
            </li>
            <li>
              <strong>Multi-Theme Professional Aesthetics</strong>: Fast, client-side, hardware-accelerated color themes tailored to obsidian and midnight styling preferences.
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
}
