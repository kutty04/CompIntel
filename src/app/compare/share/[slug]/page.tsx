"use client";

import React, { useState, useEffect, use } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../../../../lib/utils";
import { Scale, Printer, ArrowLeft, Eye, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import AIInsightsPanel from "../../../../components/AIInsightsPanel";
import { useResolvedColors } from "../../../../lib/useResolvedColors";

interface Selection {
  companyName: string;
  level: string;
}

interface SharePageProps {
  params: Promise<{ slug: string }>;
}

export default function SharedComparisonPage({ params }: SharePageProps) {
  const { slug } = use(params);
  const colors = useResolvedColors();
  const [selections, setSelections] = useState<Selection[]>([]);
  const [comparisonStats, setComparisonStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [metadata, setMetadata] = useState<{
    title?: string | null;
    views: number;
    createdAt: string;
    lastViewedAt?: string | null;
  } | null>(null);

  useEffect(() => {
    async function loadSharedData() {
      try {
        const res = await fetch(`/api/comparison/share/${slug}`);
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        
        setMetadata({
          title: data.title,
          views: data.views,
          createdAt: data.createdAt,
          lastViewedAt: data.lastViewedAt
        });

        // Next, fetch the statistics for these selections
        const sels: Selection[] = Array.isArray(data.comparisonData) 
          ? data.comparisonData 
          : (data.comparisonData.selections || []);
        
        setSelections(sels);

        const computed = await Promise.all(
          sels.map(async (sel) => {
            if (!sel.companyName) {
              return { companyName: "", level: "", base: 0, bonus: 0, stock: 0, total: 0, entriesCount: 0 };
            }
            
            try {
              const compRes = await fetch(`/api/company/${encodeURIComponent(sel.companyName)}`);
              if (!compRes.ok) {
                return { companyName: sel.companyName, level: sel.level, base: 0, bonus: 0, stock: 0, total: 0, entriesCount: 0, isMock: true };
              }
              
              const companyDetails = await compRes.json();
              const levelEntries = companyDetails.salaryEntries.filter(
                (e: any) => e.level.toUpperCase() === sel.level.toUpperCase()
              );

              if (levelEntries.length === 0) {
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
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadSharedData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-accent">Loading shared comparison...</p>
      </div>
    );
  }

  if (error || selections.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          title="Comparison Not Found"
          description="The shared comparison link is invalid or may have expired."
          actionText="Create New Comparison"
          actionHref="/compare"
          type="comparison"
        />
      </div>
    );
  }

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
      
      {/* Back Button */}
      <div className="no-print">
        <Link 
          href="/compare" 
          className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Comparison Tool
        </Link>
      </div>

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-primary flex items-center gap-2">
            <Scale className="w-6 h-6 text-primary" />
            {metadata?.title || "Shared Compensation Comparison"}
          </h1>
          <p className="text-xs text-accent mt-1">
            Viewing a saved comparison of compensation structures.
          </p>
        </div>
        
        <button
          onClick={() => window.print()}
          className="glass-panel flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-primary hover:bg-[rgba(255,255,255,0.05)] cursor-pointer no-print"
        >
          <Printer className="w-3.5 h-3.5" />
          PRINT REPORT
        </button>
      </div>

      {/* Analytics Panel */}
      {metadata && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
          <div className="glass-panel rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-[rgba(255,255,255,0.02)] border border-border/40 rounded-lg text-accent">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-accent uppercase tracking-wider">Total Views</div>
              <div className="text-sm font-extrabold text-primary">{metadata.views}</div>
            </div>
          </div>
          <div className="glass-panel rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-[rgba(255,255,255,0.02)] border border-border/40 rounded-lg text-accent">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-accent uppercase tracking-wider">Created Date</div>
              <div className="text-sm font-extrabold text-primary">
                {new Date(metadata.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="glass-panel rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-[rgba(255,255,255,0.02)] border border-border/40 rounded-lg text-accent">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-accent uppercase tracking-wider">Last Viewed</div>
              <div className="text-sm font-extrabold text-primary">
                {metadata.lastViewedAt ? new Date(metadata.lastViewedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                }) : "Just now"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print-Only Footer */}
      <div className="print-only print-flex justify-between items-center border-t border-border pt-4 mt-8 text-[9px] text-accent">
        <span>Generated by CompIntel</span>
        <span>Confidential • Verification Report</span>
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

    </div>
  );
}