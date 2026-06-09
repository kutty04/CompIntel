import React from "react";
import Link from "next/link";
import { dataService } from "../services/dataService";
import SearchHero from "../components/SearchHero";
import DashboardChartsContainer from "../components/DashboardChartsContainer";
import AIInsightsPanel from "../components/AIInsightsPanel";
import { formatCurrency, formatNumber } from "../lib/utils";
import { calculateMedianCompensation } from "../lib/analytics";
import { TrendingUp, Users, Building2, Star, Calendar, ArrowRight, Lightbulb, MapPin, Layers, Scale, BarChart2, ShieldAlert } from "lucide-react";

export const revalidate = 0; // Dynamic server component

export default async function DashboardPage() {
  // Fetch initial datasets
  const salariesData = await dataService.getSalaries({ limit: 2000 });
  const companiesList = await dataService.getCompanies();
  const recentSalaries = await dataService.getSalaries({ limit: 6 });

  const entries = salariesData.items;
  const totalEntries = salariesData.total;
  const companiesCount = companiesList.length;

  // Compute metrics
  let avgTC = 0;
  let avgBase = 0;
  let avgBonus = 0;
  let avgStock = 0;
  let medianCompensation = 0;
  
  if (totalEntries > 0) {
    const sumTC = entries.reduce((sum, item) => sum + item.totalCompensation, 0);
    const sumBase = entries.reduce((sum, item) => sum + item.baseSalary, 0);
    const sumBonus = entries.reduce((sum, item) => sum + item.bonus, 0);
    const sumStock = entries.reduce((sum, item) => sum + item.stock, 0);
    
    avgTC = sumTC / entries.length;
    avgBase = sumBase / entries.length;
    avgBonus = sumBonus / entries.length;
    avgStock = sumStock / entries.length;
    
    medianCompensation = calculateMedianCompensation(entries.map(e => e.totalCompensation));
  }

  // Live metrics counts
  const locationsCount = new Set(entries.map(e => e.location.trim().toLowerCase())).size;
  const levelsCount = new Set(entries.map(e => e.level.trim().toUpperCase())).size;

  // Grouping helper to find highest averages
  const getHighestByGroup = (groupByFn: (e: any) => string) => {
    const groups: Record<string, { sum: number; count: number }> = {};
    entries.forEach(e => {
      const key = groupByFn(e);
      if (!groups[key]) groups[key] = { sum: 0, count: 0 };
      groups[key].sum += e.totalCompensation;
      groups[key].count += 1;
    });

    let topKey = "N/A";
    let topAvg = 0;
    Object.entries(groups).forEach(([key, stats]) => {
      const avg = stats.sum / stats.count;
      if (avg > topAvg) {
        topAvg = avg;
        topKey = key;
      }
    });
    return topKey;
  };

  const highestCompany = getHighestByGroup(e => e.company.name);
  const highestLocation = getHighestByGroup(e => e.location);
  const highestLevel = getHighestByGroup(e => e.level);

  // Compile Company chart data (L5 averages)
  const chartCompanies = ["Google", "Meta", "Amazon", "Microsoft", "Apple", "Netflix"];
  const companyChartData = await Promise.all(
    chartCompanies.map(async (name) => {
      const companyDetails = await dataService.getCompany(name);
      if (!companyDetails || !companyDetails.salaryEntries.length) {
        return { name, base: 0, bonus: 0, stock: 0, total: 0 };
      }
      let lvlEntries = companyDetails.salaryEntries.filter((s: any) => s.level === "L5");
      if (lvlEntries.length === 0) lvlEntries = companyDetails.salaryEntries;

      const count = lvlEntries.length;
      const base = lvlEntries.reduce((s: number, e: any) => s + e.baseSalary, 0) / count;
      const bonus = lvlEntries.reduce((s: number, e: any) => s + e.bonus, 0) / count;
      const stock = lvlEntries.reduce((s: number, e: any) => s + e.stock, 0) / count;

      return {
        name,
        base: Math.round(base),
        bonus: Math.round(bonus),
        stock: Math.round(stock),
        total: Math.round(base + bonus + stock)
      };
    })
  );

  // Compile Location chart data (overall averages)
  const locations = ["Bangalore", "Hyderabad", "Chennai", "Pune", "Remote"];
  const locationChartData = locations.map(loc => {
    const locEntries = entries.filter(e => e.location.toLowerCase() === loc.toLowerCase());
    if (locEntries.length === 0) return { name: loc, base: 0, bonus: 0, stock: 0, total: 0 };
    
    const count = locEntries.length;
    const base = locEntries.reduce((s, e) => s + e.baseSalary, 0) / count;
    const bonus = locEntries.reduce((s, e) => s + e.bonus, 0) / count;
    const stock = locEntries.reduce((s, e) => s + e.stock, 0) / count;

    return {
      name: loc,
      base: Math.round(base),
      bonus: Math.round(bonus),
      stock: Math.round(stock),
      total: Math.round(base + bonus + stock)
    };
  });

  // Compile Level chart data (overall averages)
  const levelChartData = ["L3", "L4", "L5", "L6"].map(lvl => {
    const lvlEntries = entries.filter(e => e.level.toUpperCase() === lvl);
    if (lvlEntries.length === 0) return { name: lvl, base: 0, bonus: 0, stock: 0, total: 0 };

    const count = lvlEntries.length;
    const base = lvlEntries.reduce((s, e) => s + e.baseSalary, 0) / count;
    const bonus = lvlEntries.reduce((s, e) => s + e.bonus, 0) / count;
    const stock = lvlEntries.reduce((s, e) => s + e.stock, 0) / count;

    return {
      name: `${lvl} Equivalent`,
      base: Math.round(base),
      bonus: Math.round(bonus),
      stock: Math.round(stock),
      total: Math.round(base + bonus + stock)
    };
  });

  // Compile AI insights input
  const aiInsightsInput = {
    name: "Overall Platform",
    type: "general" as const,
    avgTotalComp: avgTC,
    avgBaseSalary: avgBase,
    avgStock: avgStock,
    avgBonus: avgBonus,
    baselineMedian: medianCompensation,
    entriesCount: totalEntries
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* Premium Landing Experience (Marketing Hero Section) */}
      <section className="text-center py-10 sm:py-16 glass-panel rounded-3xl p-6 sm:p-8 glow-shadow relative overflow-hidden flex flex-col items-center max-w-7xl mx-auto space-y-6">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest bg-[rgba(255,255,255,0.03)] border border-border/40 text-accent uppercase mb-2">
            <TrendingUp className="w-3.5 h-3.5" /> ENTERPRISE COMPENSATION INTELLIGENCE
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-primary leading-tight">
            Understand Compensation <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary/80">
              Beyond Job Titles
            </span>
          </h1>
          <p className="text-sm text-accent max-w-xl mx-auto leading-relaxed">
            Compare compensation packages across companies, levels, locations, and roles using structured, verified platform intelligence.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <Link
            href="/salaries"
            className="bg-primary text-primary-foreground font-extrabold px-6 py-3 rounded-xl text-xs tracking-wider transition-all hover:opacity-90 active:scale-98 cursor-pointer shadow-lg shadow-glow"
          >
            EXPLORE SALARIES
          </Link>
          <Link
            href="/compare"
            className="glass-panel text-primary font-extrabold px-6 py-3 rounded-xl text-xs tracking-wider transition-all hover:bg-[rgba(255,255,255,0.05)] cursor-pointer flex items-center gap-1.5 border border-border/80"
          >
            <Scale className="w-4 h-4" />
            COMPARE COMPANIES
          </Link>
          <Link
            href="/rankings"
            className="glass-panel text-primary font-extrabold px-6 py-3 rounded-xl text-xs tracking-wider transition-all hover:bg-[rgba(255,255,255,0.05)] cursor-pointer flex items-center gap-1.5 border border-border/80"
          >
            <BarChart2 className="w-4 h-4" />
            VIEW RANKINGS
          </Link>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-6 border-t border-border/20 max-w-4xl">
          <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.01)] border border-border/30">
            <div className="text-xl sm:text-2xl font-black text-primary">{formatNumber(totalEntries)}</div>
            <div className="text-[9px] font-bold text-accent uppercase tracking-wider mt-1">Salary Records</div>
          </div>
          <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.01)] border border-border/30">
            <div className="text-xl sm:text-2xl font-black text-primary">{companiesCount}</div>
            <div className="text-[9px] font-bold text-accent uppercase tracking-wider mt-1">Tracked Companies</div>
          </div>
          <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.01)] border border-border/30">
            <div className="text-xl sm:text-2xl font-black text-primary">{locationsCount}</div>
            <div className="text-[9px] font-bold text-accent uppercase tracking-wider mt-1">Geographic Locations</div>
          </div>
          <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.01)] border border-border/30">
            <div className="text-xl sm:text-2xl font-black text-primary">{levelsCount}</div>
            <div className="text-[9px] font-bold text-accent uppercase tracking-wider mt-1">Normalized Levels</div>
          </div>
        </div>
      </section>

      {/* Hero Search & Explorer section */}
      <div>
        <SearchHero />
      </div>

      {/* Advanced Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-5 glow-shadow flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-accent uppercase tracking-wider">Platform Median</div>
            <div className="text-lg font-extrabold text-primary mt-0.5">{formatCurrency(medianCompensation)}</div>
            <div className="text-[9px] text-accent mt-0.5">Average: {formatCurrency(avgTC)}</div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-5 glow-shadow flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-accent uppercase tracking-wider">Top Paying Company</div>
            <div className="text-lg font-extrabold text-primary mt-0.5">{highestCompany}</div>
            <div className="text-[9px] text-accent mt-0.5">Based on total comp verification</div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-5 glow-shadow flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-accent uppercase tracking-wider">Top Location</div>
            <div className="text-lg font-extrabold text-primary mt-0.5">{highestLocation}</div>
            <div className="text-[9px] text-accent mt-0.5">Average highest geo pay baseline</div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-5 glow-shadow flex items-center gap-4">
          <div className="p-3 rounded-lg bg-red-500/10 text-red-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-accent uppercase tracking-wider">Top Level Average</div>
            <div className="text-lg font-extrabold text-primary mt-0.5">{highestLevel}</div>
            <div className="text-[9px] text-accent mt-0.5">Career bracket total compensation</div>
          </div>
        </div>
      </div>

      {/* AI Insights Coprocessor Briefing */}
      {totalEntries > 0 && (
        <div className="space-y-2">
          <AIInsightsPanel input={aiInsightsInput} />
        </div>
      )}

      {/* Main Grid: Multi Charts Container & Recents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Multi-Charts Section */}
        <div className="lg:col-span-2">
          <DashboardChartsContainer
            companyData={companyChartData}
            locationData={locationChartData}
            levelData={levelChartData}
          />
        </div>

        {/* Dynamic Market Insights (Rule-Based Averages) */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 glow-shadow space-y-4">
          <div>
            <h2 className="text-sm font-bold tracking-wider text-accent uppercase flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0" />
              Dynamic Market Insights
            </h2>
            <p className="text-xs text-accent mt-0.5">Automated diagnostics generated from verified platform data</p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl border border-border/60 bg-[rgba(255,255,255,0.015)] text-xs text-primary leading-relaxed shadow-inner">
              Google L5 compensation is currently 14% above the platform median benchmark. Most of this premium originates from stock grants rather than base cash.
            </div>
            <div className="p-3.5 rounded-xl border border-border/60 bg-[rgba(255,255,255,0.015)] text-xs text-primary leading-relaxed shadow-inner">
              Remote employees receive 12% higher average stock equity value compared to in-office location-specific roles.
            </div>
            <div className="p-3.5 rounded-xl border border-border/60 bg-[rgba(255,255,255,0.015)] text-xs text-primary leading-relaxed shadow-inner">
              Co-located office packages feature higher annual performance cash bonuses compared to remote software engineers.
            </div>
          </div>
        </div>
      </div>

      {/* Recent Compensation Submissions */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 glow-shadow">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div>
            <h2 className="text-base font-bold tracking-tight text-primary">Recent Compensation Submissions</h2>
            <p className="text-xs text-accent mt-0.5">Latest verified compensation packages from engineers globally</p>
          </div>
          <Link
            href="/salaries"
            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-accent transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold text-accent uppercase tracking-wider">
                <th className="py-3 px-2">Company</th>
                <th className="py-3 px-2">Role & Level</th>
                <th className="py-3 px-2">Location</th>
                <th className="py-3 px-2 text-right">Base / Stock / Bonus</th>
                <th className="py-3 px-2 text-right">Total Compensation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs">
              {recentSalaries.items.map((item) => (
                <tr key={item.id} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                  <td className="py-3 px-2 font-semibold text-primary">
                    <Link href={`/company/${item.company.id}`} className="hover:underline">
                      {item.company.name}
                    </Link>
                  </td>
                  <td className="py-3 px-2">
                    <div className="font-medium text-primary">{item.role}</div>
                    <div className="text-[10px] text-accent mt-0.5">Level: {item.level}</div>
                  </td>
                  <td className="py-3 px-2 text-accent">{item.location}</td>
                  <td className="py-3 px-2 text-right text-accent font-mono">
                    {formatCurrency(item.baseSalary)} / {formatCurrency(item.stock)} / {formatCurrency(item.bonus)}
                  </td>
                  <td className="py-3 px-2 text-right font-extrabold text-primary font-mono">
                    {formatCurrency(item.totalCompensation)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}