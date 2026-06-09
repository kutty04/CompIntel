"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../../lib/utils";
import { Scale, Plus, Trash2, Save, CheckCircle, AlertCircle, Share2, Printer } from "lucide-react";
import AIInsightsPanel from "../../components/AIInsightsPanel";
import { useResolvedColors } from "../../lib/useResolvedColors";

interface CompanySelect {
  id: string;
  name: string;
}

interface Selection {
  companyName: string;
  level: string;
}

function ComparePageContent() {
  const { data: session } = useSession();
  const colors = useResolvedColors();
  const searchParams = useSearchParams();
  
  // List of all verified companies
  const [companies, setCompanies] = useState<CompanySelect[]>([]);
  
  // User selections (starts with two empty comparisons)
  const [selections, setSelections] = useState<Selection[]>([
    { companyName: "Google", level: "L4" },
    { companyName: "Meta", level: "L4" }
  ]);

  // Sync selections with query parameters if present
  useEffect(() => {
    const c1 = searchParams.get("c1");
    const l1 = searchParams.get("l1");
    const c2 = searchParams.get("c2");
    const l2 = searchParams.get("l2");
    const c3 = searchParams.get("c3");
    const l3 = searchParams.get("l3");

    if (c1 || c2) {
      const initialSels: Selection[] = [];
      if (c1) initialSels.push({ companyName: c1, level: l1 || "L4" });
      if (c2) initialSels.push({ companyName: c2, level: l2 || "L4" });
      if (c3) initialSels.push({ companyName: c3, level: l3 || "L4" });
      if (initialSels.length > 0) {
        setSelections(initialSels);
      }
    }
  }, [searchParams]);

  // Aggregated data for each selection
  const [comparisonStats, setComparisonStats] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch company list on mount
  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetch("/api/companies");
        if (res.ok) {
          const data = await res.json();
          setCompanies(data);
        }
      } catch (err) {
        console.error("Failed to load companies list", err);
      }
    }
    loadCompanies();
  }, []);

  // Fetch and compute aggregates whenever selections change
  useEffect(() => {
    async function computeComparison() {
      setLoading(true);
      const computed = await Promise.all(
        selections.map(async (sel) => {
          if (!sel.companyName) {
            return { companyName: "", level: "", base: 0, bonus: 0, stock: 0, total: 0, entriesCount: 0 };
          }
          
          try {
            const res = await fetch(`/api/company/${encodeURIComponent(sel.companyName)}`);
            if (!res.ok) {
              return { companyName: sel.companyName, level: sel.level, base: 0, bonus: 0, stock: 0, total: 0, entriesCount: 0, isMock: true };
            }
            
            const companyDetails = await res.json();
            const levelEntries = companyDetails.salaryEntries.filter(
              (e: any) => e.level.toUpperCase() === sel.level.toUpperCase()
            );

            if (levelEntries.length === 0) {
              // Fallback to overall company averages if no level match
              const count = companyDetails.salaryEntries.length;
              if (count === 0) {
                return { companyName: sel.companyName, level: sel.level, base: 0, bonus: 0, stock: 0, total: 0, entriesCount: 0, noData: true };
              }
              const base = companyDetails.salaryEntries.reduce((s: number, e: any) => s + e.baseSalary, 0) / count;
              const bonus = companyDetails.salaryEntries.reduce((s: number, e: any) => s + e.bonus, 0) / count;
              const stock = companyDetails.salaryEntries.reduce((s: number, e: any) => s + e.stock, 0) / count;
              
              return {
                companyName: companyDetails.name,
                level: sel.level,
                base: Math.round(base),
                bonus: Math.round(bonus),
                stock: Math.round(stock),
                total: Math.round(base + bonus + stock),
                entriesCount: count,
                isFallback: true
              };
            }

            const count = levelEntries.length;
            const base = levelEntries.reduce((s: number, e: any) => s + e.baseSalary, 0) / count;
            const bonus = levelEntries.reduce((s: number, e: any) => s + e.bonus, 0) / count;
            const stock = levelEntries.reduce((s: number, e: any) => s + e.stock, 0) / count;

            return {
              companyName: companyDetails.name,
              level: sel.level,
              base: Math.round(base),
              bonus: Math.round(bonus),
              stock: Math.round(stock),
              total: Math.round(base + bonus + stock),
              entriesCount: count
            };
          } catch (err) {
            return { companyName: sel.companyName, level: sel.level, base: 0, bonus: 0, stock: 0, total: 0, entriesCount: 0 };
          }
        })
      );
      
      setComparisonStats(computed);
      setLoading(false);
    }

    computeComparison();
  }, [selections]);

  const handleSelectionChange = (index: number, field: keyof Selection, value: string) => {
    const updated = [...selections];
    updated[index] = { ...updated[index], [field]: value };
    setSelections(updated);
    setMessage(null);
  };

  const addSelection = () => {
    if (selections.length < 3) {
      setSelections([...selections, { companyName: "Amazon", level: "L4" }]);
      setMessage(null);
    }
  };

  const removeSelection = (index: number) => {
    if (selections.length > 1) {
      setSelections(selections.filter((_, i) => i !== index));
      setMessage(null);
    }
  };

  const handleSaveComparison = async () => {
    if (!session) {
      setMessage({ type: "error", text: "Please sign in to save your comparisons." });
      return;
    }

    setSaveLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/comparison/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comparisonData: { selections } })
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Comparison saved successfully! View it in your profile." });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to save comparison" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred while saving." });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleShareComparison = async () => {
    setShareLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/comparison/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comparisonData: selections })
      });
      if (res.ok) {
        const data = await res.json();
        setSharedUrl(`${window.location.origin}/compare/share/${data.slug}`);
      } else {
        setMessage({ type: "error", text: "Failed to generate share link" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred while sharing." });
    } finally {
      setShareLoading(false);
    }
  };

  const levels = ["L3", "L4", "L5", "L6"];

  // Filter valid comparison stats to populate the chart
  const chartData = comparisonStats
    .filter(s => s.companyName && s.total > 0)
    .map(s => ({
      name: `${s.companyName} ${s.level}`,
      base: s.base,
      bonus: s.bonus,
      stock: s.stock,
      total: s.total
    }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-primary flex items-center gap-2">
            <Scale className="w-6 h-6 text-primary" />
            Side-by-Side Compensation Comparison
          </h1>
          <p className="text-xs text-accent mt-1">
            Compare compensation components (base, stock grants, bonuses) across different company tiers and levels.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 no-print">
          {selections.some(s => s.companyName) && (
            <button
              onClick={() => window.print()}
              className="glass-panel flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-primary hover:bg-[rgba(255,255,255,0.05)] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              PRINT REPORT
            </button>
          )}

          {selections.some(s => s.companyName) && (
            <button
              onClick={handleShareComparison}
              disabled={shareLoading}
              className="glass-panel flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-primary hover:bg-[rgba(255,255,255,0.05)] cursor-pointer disabled:opacity-50"
            >
              <Share2 className="w-3.5 h-3.5" />
              {shareLoading ? "SHARING..." : "SHARE LINK"}
            </button>
          )}

          {session && selections.some(s => s.companyName) && (
            <button
              onClick={handleSaveComparison}
              disabled={saveLoading}
              className="glass-panel flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-primary hover:bg-[rgba(255,255,255,0.05)] cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saveLoading ? "SAVING..." : "SAVE COMPARISON"}
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-start gap-2.5 text-xs no-print ${
          message.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          <span>{message.text}</span>
        </div>
      )}

      {/* Selectors Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        {selections.map((sel, idx) => (
          <div key={idx} className="glass-panel rounded-xl p-5 glow-shadow space-y-3 relative">
            <div className="flex justify-between items-center border-b border-border pb-2 mb-1">
              <span className="text-[10px] font-bold text-accent tracking-widest uppercase">Target {idx + 1}</span>
              {selections.length > 1 && (
                <button
                  onClick={() => removeSelection(idx)}
                  className="text-accent hover:text-red-400 transition-colors cursor-pointer"
                  title="Remove comparison"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Company Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-accent uppercase">Company</label>
              <select
                value={sel.companyName}
                onChange={(e) => handleSelectionChange(idx, "companyName", e.target.value)}
                className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-2.5 py-2 text-xs text-primary focus:outline-none focus:border-accent"
              >
                <option value="">Select Company</option>
                {companies.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Level Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-accent uppercase">Level</label>
              <select
                value={sel.level}
                onChange={(e) => handleSelectionChange(idx, "level", e.target.value)}
                className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-2.5 py-2 text-xs text-primary focus:outline-none focus:border-accent"
              >
                {levels.map(l => (
                  <option key={l} value={l}>{l} Equivalent</option>
                ))}
              </select>
            </div>
          </div>
        ))}

        {/* Add comparison card */}
        {selections.length < 3 && (
          <button
            onClick={addSelection}
            className="glass-panel rounded-xl p-5 glow-shadow flex flex-col items-center justify-center border-dashed border-2 border-border hover:border-accent hover:bg-[rgba(255,255,255,0.01)] transition-all cursor-pointer min-h-[160px] text-accent hover:text-primary group"
          >
            <Plus className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider">Add Comparison</span>
          </button>
        )}
      </div>

      {/* Comparison Visualizer Panel */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recharts chart */}
          <div className="glass-panel rounded-2xl p-5 sm:p-6 lg:col-span-2 glow-shadow">
            <h2 className="text-sm font-bold tracking-wider text-accent uppercase">Pay Scale Comparison</h2>
            <p className="text-xs text-accent mt-0.5">Base, Bonus, and Stock components compared side-by-side</p>
            <div className="mt-6">
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--accent)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--accent)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(20, 20, 23, 0.9)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        color: "var(--foreground)",
                        fontSize: "12px"
                      }}
                      formatter={(value: any, name: string) => [formatCurrency(value), name.toUpperCase()]}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="base" name="Base Salary" fill="#3b82f6" />
                    <Bar dataKey="bonus" name="Bonus" fill="#10b981" />
                    <Bar dataKey="stock" name="Stock Value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="glass-panel rounded-2xl p-5 sm:p-6 glow-shadow">
            <h2 className="text-sm font-bold tracking-wider text-accent uppercase border-b border-border pb-3 mb-4">
              Compensation Details
            </h2>

            <div className="space-y-4">
              {comparisonStats.map((s, index) => {
                if (!s.companyName) return null;
                return (
                  <div key={index} className="space-y-2 pb-3 border-b border-border/40 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-primary">{s.companyName} {s.level}</span>
                      <span className="font-extrabold text-sm text-primary font-mono">{formatCurrency(s.total)}</span>
                    </div>

                    {s.noData ? (
                      <div className="text-[10px] text-red-400">No verified data submissions.</div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-1 text-[10px] text-accent font-mono">
                          <div>
                            <span className="block text-[8px] uppercase">Base</span>
                            <span className="font-semibold text-primary">{formatCurrency(s.base)}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase">Stock</span>
                            <span className="font-semibold text-primary">{formatCurrency(s.stock)}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase">Bonus</span>
                            <span className="font-semibold text-primary">{formatCurrency(s.bonus)}</span>
                          </div>
                        </div>

                        {s.isFallback && (
                          <div className="text-[9px] text-yellow-500/80 leading-none mt-1">
                            * No level match. Showing company overall averages.
                          </div>
                        )}
                        
                        {!s.isFallback && (
                          <div className="text-[9px] text-accent/80 leading-none">
                            Based on {s.entriesCount} verified submission(s).
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Share Link Modal */}
      {sharedUrl && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 no-print">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative glow-shadow animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold tracking-wider text-accent uppercase mb-2">Share Comparison</h3>
            <p className="text-xs text-accent mb-4">
              Anyone with this link can view this side-by-side comparison.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={sharedUrl}
                className="flex-1 bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-3 py-2 text-xs text-primary font-mono focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sharedUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs tracking-wider transition-all hover:opacity-90 active:scale-95 cursor-pointer"
              >
                {copied ? "COPIED" : "COPY"}
              </button>
            </div>
            <button
              onClick={() => setSharedUrl(null)}
              className="mt-4 w-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-border text-primary font-semibold py-2 rounded-lg text-xs tracking-wider transition-all cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-xs text-accent">Loading comparison visualizer...</div>}>
      <ComparePageContent />
    </Suspense>
  );
}