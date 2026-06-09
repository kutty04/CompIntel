"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { calculateMarketPosition, calculatePercentiles } from "../../lib/analytics";
import PercentileDistribution from "../../components/PercentileDistribution";
import AIInsightsPanel from "../../components/AIInsightsPanel";
import EmptyState from "../../components/EmptyState";
import { formatCurrency } from "../../lib/utils";
import { HelpCircle, Calculator, TrendingDown, TrendingUp, AlertCircle, Sparkles } from "lucide-react";

interface CompanySelect {
  id: string;
  name: string;
}

function InsightsPageContent() {
  const searchParams = useSearchParams();
  const [companies, setCompanies] = useState<CompanySelect[]>([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("Software Engineer");
  const [level, setLevel] = useState("L4");
  const [location, setLocation] = useState("Bangalore");
  const [currentComp, setCurrentComp] = useState<number | "">("");

  // Result state
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [leveledStats, setLeveledStats] = useState<any>(null);
  const [insufficientData, setInsufficientData] = useState(false);
  const [segmentStats, setSegmentStats] = useState<any>(null);

  // Fetch companies for select input
  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetch("/api/companies");
        if (res.ok) {
          const data = await res.json();
          setCompanies(data);
          if (data.length > 0) setCompany(data[0].name);
        }
      } catch (err) {
        console.error("Failed to load companies", err);
      }
    }
    loadCompanies();
  }, []);

  // Handle prefilled query parameters from guided demo modes
  useEffect(() => {
    if (companies.length === 0) return;

    const pCompany = searchParams.get("company");
    const pRole = searchParams.get("role");
    const pLevel = searchParams.get("level");
    const pLocation = searchParams.get("location");
    const pComp = searchParams.get("comp");

    if (pCompany) setCompany(pCompany);
    if (pRole) setRole(pRole);
    if (pLevel) setLevel(pLevel);
    if (pLocation) setLocation(pLocation);
    if (pComp) setCurrentComp(Number(pComp));

    if (pCompany && pRole && pLevel && pLocation && pComp) {
      const runCalculation = async () => {
        setLoading(true);
        setSearched(true);
        try {
          const params = new URLSearchParams();
          params.set("company", pCompany);
          params.set("role", pRole);
          params.set("level", pLevel);
          params.set("location", pLocation);
          params.set("limit", "100");

          const res = await fetch(`/api/salaries?${params.toString()}`);
          if (res.ok) {
            const data = await res.json();
            if (data.total < 3) {
              setInsufficientData(true);
            } else {
              const TCs = data.items.map((item: any) => item.totalCompensation);
              const position = calculateMarketPosition(Number(pComp), TCs);
              const percentiles = calculatePercentiles(TCs);
              
              const count = data.items.length;
              const avgTC = TCs.reduce((s: number, v: number) => s + v, 0) / count;
              const avgBase = data.items.reduce((s: number, e: any) => s + e.baseSalary, 0) / count;
              const avgStock = data.items.reduce((s: number, e: any) => s + e.stock, 0) / count;
              const avgBonus = data.items.reduce((s: number, e: any) => s + e.bonus, 0) / count;

              setResult(position);
              setLeveledStats(percentiles);
              setSegmentStats({
                avgTotalComp: Math.round(avgTC),
                avgBaseSalary: Math.round(avgBase),
                avgStock: Math.round(avgStock),
                avgBonus: Math.round(avgBonus),
                entriesCount: data.total
              });
            }
          } else {
            setInsufficientData(true);
          }
        } catch (e) {
          setInsufficientData(true);
        } finally {
          setLoading(false);
        }
      };
      runCalculation();
    }
  }, [searchParams, companies]);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentComp || Number(currentComp) <= 0) return;

    setLoading(true);
    setSearched(true);
    setInsufficientData(false);
    setResult(null);

    try {
      // Query verified packages for this segment
      const params = new URLSearchParams();
      if (company) params.set("company", company);
      params.set("role", role);
      params.set("level", level);
      params.set("location", location);
      params.set("limit", "100");

      const res = await fetch(`/api/salaries?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        
        // We need at least 3 records for an accurate market percentile curve
        if (data.total < 3) {
          setInsufficientData(true);
        } else {
          const TCs = data.items.map((item: any) => item.totalCompensation);
          const position = calculateMarketPosition(Number(currentComp), TCs);
          const percentiles = calculatePercentiles(TCs);
          
          const count = data.items.length;
          const avgTC = TCs.reduce((s: number, v: number) => s + v, 0) / count;
          const avgBase = data.items.reduce((s: number, e: any) => s + e.baseSalary, 0) / count;
          const avgStock = data.items.reduce((s: number, e: any) => s + e.stock, 0) / count;
          const avgBonus = data.items.reduce((s: number, e: any) => s + e.bonus, 0) / count;

          setResult(position);
          setLeveledStats(percentiles);
          setSegmentStats({
            avgTotalComp: Math.round(avgTC),
            avgBaseSalary: Math.round(avgBase),
            avgStock: Math.round(avgStock),
            avgBonus: Math.round(avgBonus),
            entriesCount: data.total
          });
        }
      } else {
        setInsufficientData(true);
      }
    } catch (err) {
      setInsufficientData(true);
    } finally {
      setLoading(false);
    }
  };

  const roles = ["Software Engineer", "Product Manager", "Data Scientist", "UX Designer"];
  const levels = ["L3", "L4", "L5", "L6"];
  const locations = ["Bangalore", "Hyderabad", "Chennai", "Pune", "Remote"];

  const aiInsightsInput = segmentStats ? {
    name: `${company} ${level}`,
    type: "company" as const,
    avgTotalComp: segmentStats.avgTotalComp,
    avgBaseSalary: segmentStats.avgBaseSalary,
    avgStock: segmentStats.avgStock,
    avgBonus: segmentStats.avgBonus,
    percentiles: leveledStats,
    entriesCount: segmentStats.entriesCount
  } : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-primary flex items-center gap-2">
          <Calculator className="w-6 h-6 text-primary" />
          "Am I Underpaid?" Calculator
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-400" /> Premium Intel
          </span>
        </h1>
        <p className="text-xs text-accent mt-1">
          Benchmark your compensation dynamically against verified peer groups to identify underpayment gaps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Form Panel */}
        <div className="md:col-span-1">
          <form onSubmit={handleCalculate} className="glass-panel rounded-2xl p-5 glow-shadow space-y-4">
            <h3 className="text-xs font-bold tracking-wider text-accent uppercase border-b border-border pb-2">
              Bespoke Parameters
            </h3>

            {/* Company Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-accent uppercase">Company Focus</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-2.5 py-2.5 text-xs text-primary focus:outline-none"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.name} className="bg-background">{c.name}</option>
                ))}
              </select>
            </div>

            {/* Role Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-accent uppercase">Job Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-2.5 py-2.5 text-xs text-primary focus:outline-none"
              >
                {roles.map(r => (
                  <option key={r} value={r} className="bg-background">{r}</option>
                ))}
              </select>
            </div>

            {/* Level Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-accent uppercase">Career Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-2.5 py-2.5 text-xs text-primary focus:outline-none"
              >
                {levels.map(l => (
                  <option key={l} value={l} className="bg-background">{l} Equivalent</option>
                ))}
              </select>
            </div>

            {/* Location Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-accent uppercase">Geographic Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-2.5 py-2.5 text-xs text-primary focus:outline-none"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc} className="bg-background">{loc}</option>
                ))}
              </select>
            </div>

            {/* Current Comp Input */}
            <div className="space-y-1 border-t border-border pt-4">
              <label className="text-[10px] font-bold text-accent uppercase">Current Total Compensation ($/yr)</label>
              <input
                type="number"
                required
                min={1}
                value={currentComp}
                onChange={(e) => setCurrentComp(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 75000"
                className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-3 py-2.5 text-xs text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-black py-3 rounded-lg text-xs tracking-wider transition-all hover:opacity-90 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "ANALYZING..." : "DIAGNOSE PAYSCALE"}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2">
          {!searched ? (
            <div className="glass-panel rounded-2xl p-10 glow-shadow text-center flex flex-col justify-center items-center h-full min-h-[300px] space-y-4">
              <Calculator className="w-12 h-12 text-accent opacity-30 animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-primary">Awaiting Input Parameters</h4>
                <p className="text-xs text-accent max-w-xs mx-auto leading-relaxed mt-1">
                  Specify your parameters in the panel to compute your percentile positioning relative to market averages.
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="glass-panel rounded-2xl p-10 glow-shadow text-center flex flex-col justify-center items-center h-full min-h-[300px] space-y-4 animate-pulse">
              <div className="w-12 h-12 bg-border/20 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-48 bg-border/20 rounded mx-auto" />
                <div className="h-3 w-64 bg-border/15 rounded mx-auto" />
              </div>
            </div>
          ) : insufficientData ? (
            <div className="h-full flex items-center justify-center min-h-[300px]">
              <EmptyState
                type="search"
                title="Not enough data available"
                description="We currently lack sufficient verification records for this specific company, level, and location combination. Try broadening your location to 'Remote' or leveling selection."
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Scorecard */}
              <div className="glass-panel rounded-2xl p-6 glow-shadow space-y-5">
                <div className="flex justify-between items-center border-b border-border/40 pb-4">
                  <div>
                    <span className="block text-[8px] text-accent uppercase tracking-wider font-semibold">Compensation Analysis</span>
                    <h2 className="text-base font-bold text-primary">{company} ({level}) Benchmark</h2>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] text-accent uppercase tracking-wider font-semibold">Diagnostic Assessment</span>
                    <span className={`text-xs font-black uppercase px-2 py-0.5 rounded border ${
                      result.difference >= 0
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}>
                      {result.assessment}
                    </span>
                  </div>
                </div>

                {/* Big numbers split */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                  <div className="space-y-1">
                    <span className="block text-[8px] text-accent uppercase tracking-wider">Your Compensation</span>
                    <span className="text-xl font-extrabold text-primary font-mono">{formatCurrency(currentComp as number)}</span>
                  </div>
                  <div className="space-y-1 border-t sm:border-t-0 sm:border-x border-border/40 pt-4 sm:pt-0">
                    <span className="block text-[8px] text-accent uppercase tracking-wider">Market Median (P50)</span>
                    <span className="text-xl font-extrabold text-primary font-mono">{formatCurrency(result.median)}</span>
                  </div>
                  <div className="space-y-1 border-t sm:border-t-0 pt-4 sm:pt-0">
                    <span className="block text-[8px] text-accent uppercase tracking-wider">Variance</span>
                    <span className={`text-xl font-extrabold font-mono ${
                      result.difference >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {result.difference >= 0 ? "+" : ""}{result.difference}%
                    </span>
                  </div>
                </div>

                {/* Summary Advice */}
                <div className={`p-4 rounded-xl border flex items-start gap-2.5 text-xs ${
                  result.difference >= 0
                    ? "bg-emerald-500/5 border-emerald-500/25 text-emerald-400/90"
                    : "bg-red-500/5 border-red-500/25 text-red-400/90"
                }`}>
                  {result.difference >= 0 ? (
                    <TrendingUp className="w-4 h-4 mt-0.5 shrink-0" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mt-0.5 shrink-0" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold">{result.comparisonText}</p>
                    <p className="text-[10px] text-accent mt-0.5">
                      {result.difference >= 0
                        ? "Great work! Your compensation resides comfortably above the peer group median for this level."
                        : "System insight: Consider building comparison charts and using our verified platform metrics to negotiate a market adjustment."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Percentile chart display */}
              <PercentileDistribution stats={leveledStats} currentComp={Number(currentComp)} />
              {aiInsightsInput && <AIInsightsPanel input={aiInsightsInput} />}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default function InsightsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-xs text-accent">Loading diagnostics calculator...</div>}>
      <InsightsPageContent />
    </Suspense>
  );
}