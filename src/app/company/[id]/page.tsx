import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dataService } from "../../../services/dataService";
import CompanyLevelsChart from "../../../components/CompanyLevelsChart";
import AIInsightsPanel from "../../../components/AIInsightsPanel";
import PercentileDistribution from "../../../components/PercentileDistribution";
import CompensationHeatmap from "../../../components/CompensationHeatmap";
import { formatCurrency, formatNumber } from "../../../lib/utils";
import { calculatePercentiles } from "../../../lib/analytics";
import { ArrowLeft, Building2, MapPin, Calendar, Award } from "lucide-react";

export const revalidate = 0; // Dynamic server component

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyPage({ params }: PageProps) {
  const { id } = await params;
  const company = await dataService.getCompany(id);

  if (!company) {
    notFound();
  }

  const entries = company.salaryEntries;
  const totalEntries = entries.length;

  // Compute overall aggregates
  let avgTC = 0;
  let avgBase = 0;
  let avgBonus = 0;
  let avgStock = 0;
  let minTC = 0;
  let maxTC = 0;
  let overallPercentiles = { p25: 0, p50: 0, p75: 0, p90: 0 };

  if (totalEntries > 0) {
    const sumTC = entries.reduce((s: number, e: any) => s + e.totalCompensation, 0);
    const sumBase = entries.reduce((s: number, e: any) => s + e.baseSalary, 0);
    const sumBonus = entries.reduce((s: number, e: any) => s + e.bonus, 0);
    const sumStock = entries.reduce((s: number, e: any) => s + e.stock, 0);

    avgTC = sumTC / totalEntries;
    avgBase = sumBase / totalEntries;
    avgBonus = sumBonus / totalEntries;
    avgStock = sumStock / totalEntries;

    const tcValues = entries.map((e: any) => e.totalCompensation);
    minTC = Math.min(...tcValues);
    maxTC = Math.max(...tcValues);
    
    // Calculate P25, Median, P75, P90
    overallPercentiles = calculatePercentiles(tcValues);
  }

  // Group by levels (L3, L4, L5, L6)
  const levels = ["L3", "L4", "L5", "L6"];
  
  const levelsChartData = levels.map((lvl) => {
    const levelEntries = entries.filter((e: any) => e.level.toUpperCase() === lvl);
    if (levelEntries.length === 0) {
      return { level: lvl, base: 0, bonus: 0, stock: 0, total: 0, percentiles: { p25: 0, p50: 0, p75: 0, p90: 0 } };
    }

    const count = levelEntries.length;
    const base = levelEntries.reduce((s: number, e: any) => s + e.baseSalary, 0) / count;
    const bonus = levelEntries.reduce((s: number, e: any) => s + e.bonus, 0) / count;
    const stock = levelEntries.reduce((s: number, e: any) => s + e.stock, 0) / count;
    const levelTCs = levelEntries.map((e: any) => e.totalCompensation);

    return {
      level: lvl,
      base: Math.round(base),
      bonus: Math.round(bonus),
      stock: Math.round(stock),
      total: Math.round(base + bonus + stock),
      percentiles: calculatePercentiles(levelTCs)
    };
  }).filter(l => l.total > 0);

  const aiInsightsInput = {
    name: company.name,
    type: "company" as const,
    avgTotalComp: avgTC,
    avgBaseSalary: avgBase,
    avgStock: avgStock,
    avgBonus: avgBonus,
    percentiles: overallPercentiles,
    entriesCount: totalEntries
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Back navigation */}
      <div>
        <Link
          href="/salaries"
          className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> BACK TO EXPLORER
        </Link>
      </div>

      {/* Header Panel */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 glow-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-border flex items-center justify-center font-black text-2xl text-primary shadow-inner">
            {company.logo || company.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-primary leading-none">{company.name}</h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 text-xs text-accent mt-2.5">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {company.industry || "Technology"}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> HQ: {company.headquarters || "Unknown"}</span>
            </div>
          </div>
        </div>

        {/* Quick actions or info */}
        <Link
          href={`/compare?c1=${company.name}`}
          className="bg-primary text-primary-foreground font-extrabold px-5 py-3 rounded-xl text-xs tracking-wider transition-all hover:opacity-90 active:scale-98 cursor-pointer shadow-lg shadow-glow"
        >
          COMPARE THIS COMPANY
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-5 glow-shadow">
          <div className="text-[10px] font-bold text-accent uppercase tracking-wider">Average Total Comp</div>
          <div className="text-xl font-extrabold text-primary mt-1.5">{formatCurrency(avgTC)}</div>
        </div>

        <div className="glass-panel rounded-xl p-5 glow-shadow">
          <div className="text-[10px] font-bold text-accent uppercase tracking-wider">Average Base Salary</div>
          <div className="text-xl font-extrabold text-primary mt-1.5">{formatCurrency(avgBase)}</div>
        </div>

        <div className="glass-panel rounded-xl p-5 glow-shadow">
          <div className="text-[10px] font-bold text-accent uppercase tracking-wider">Average Stock / Bonus</div>
          <div className="text-base font-bold text-primary mt-2">
            {formatCurrency(avgStock)} / {formatCurrency(avgBonus)}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-5 glow-shadow">
          <div className="text-[10px] font-bold text-accent uppercase tracking-wider">Compensation Range</div>
          <div className="text-base font-bold text-primary mt-2">
            {formatCurrency(minTC)} - {formatCurrency(maxTC)}
          </div>
        </div>
      </div>

      {/* Overall Percentiles visualizer card */}
      {totalEntries > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold tracking-wider text-accent uppercase">Overall Company Distribution</h2>
          <PercentileDistribution stats={overallPercentiles} />
        </div>
      )}

      {/* AI Insights Section */}
      {totalEntries > 0 && (
        <div className="space-y-2">
          <AIInsightsPanel input={aiInsightsInput} />
        </div>
      )}

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Levels Chart */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 lg:col-span-2 glow-shadow">
          <h2 className="text-sm font-bold tracking-wider text-accent uppercase">Pay Scaling by Level</h2>
          <p className="text-xs text-accent mt-0.5">Average compensation structures across levels</p>
          <div className="mt-6">
            {levelsChartData.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-xs text-accent">
                No leveled data available for this company yet.
              </div>
            ) : (
              <CompanyLevelsChart data={levelsChartData} />
            )}
          </div>
        </div>

        {/* Leveled Breakdowns list */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 glow-shadow space-y-4">
          <div>
            <h2 className="text-sm font-bold tracking-wider text-accent uppercase">Leveled Percentile Breakdown</h2>
            <p className="text-xs text-accent mt-0.5">Annual percentiles based on submissions</p>
          </div>
          
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {levelsChartData.length === 0 ? (
              <div className="text-xs text-accent py-4 text-center">No data records found.</div>
            ) : (
              levelsChartData.map((l) => (
                <div key={l.level} className="p-3 border border-border rounded-xl space-y-3 bg-[rgba(255,255,255,0.01)]">
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="font-extrabold text-sm text-primary">{l.level} Equivalent</span>
                    <span className="font-extrabold text-sm text-primary font-mono">{formatCurrency(l.total)}</span>
                  </div>
                  
                  {/* Percentile info */}
                  <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-accent">
                    <div>P25: <span className="text-primary font-bold">{formatCurrency(l.percentiles.p25)}</span></div>
                    <div>Median: <span className="text-emerald-400 font-bold">{formatCurrency(l.percentiles.p50)}</span></div>
                    <div>P75: <span className="text-primary font-bold">{formatCurrency(l.percentiles.p75)}</span></div>
                    <div>P90: <span className="text-red-400 font-bold">{formatCurrency(l.percentiles.p90)}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Heatmap Section */}
      {totalEntries > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold tracking-wider text-accent uppercase">Regional Matrix</h2>
          <CompensationHeatmap entries={entries} />
        </div>
      )}

      {/* Salary Submission Details Table */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 glow-shadow">
        <h2 className="text-sm font-bold tracking-wider text-accent uppercase border-b border-border pb-3 mb-4">
          Verified Salary Submissions ({totalEntries})
        </h2>

        {entries.length === 0 ? (
          <div className="text-center py-10 text-xs text-accent">No submissions listed for this company.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[10px] font-bold text-accent uppercase tracking-wider">
                  <th className="py-3 px-2">Role</th>
                  <th className="py-3 px-2">Level</th>
                  <th className="py-3 px-2">Location</th>
                  <th className="py-3 px-2 text-right">Base / Stock / Bonus</th>
                  <th className="py-3 px-2 text-right">Total Compensation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {entries.map((item: any) => (
                  <tr key={item.id} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                    <td className="py-3.5 px-2">
                      <div className="font-semibold text-primary">{item.role}</div>
                      <div className="text-[10px] text-accent mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-2 font-medium text-primary">{item.level}</td>
                    <td className="py-3.5 px-2 text-accent">{item.location}</td>
                    <td className="py-3.5 px-2 text-right text-accent font-mono">
                      {formatCurrency(item.baseSalary)} / {formatCurrency(item.stock)} / {formatCurrency(item.bonus)}
                    </td>
                    <td className="py-3.5 px-2 text-right font-extrabold text-primary font-mono">
                      {formatCurrency(item.totalCompensation)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
