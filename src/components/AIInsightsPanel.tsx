"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, AlertTriangle, ShieldCheck, HelpCircle, Loader2, Info } from "lucide-react";
import { InsightsInput, AIInsightResult } from "../lib/aiInsights";

interface AIInsightsPanelProps {
  input: InsightsInput;
}

export default function AIInsightsPanel({ input }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsightResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadInsights() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch("/api/ai-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input)
        });

        if (res.ok) {
          const data = await res.json();
          setInsights(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to load insights", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (input.avgTotalComp > 0 || (input.type === "compare" && input.comparisonData && input.comparisonData.length > 0)) {
      loadInsights();
    } else {
      setLoading(false);
    }
  }, [input]);

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6 glow-shadow space-y-4 animate-pulse no-print">
        <div className="flex justify-between items-center border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-accent animate-spin" />
            <div className="w-32 h-3 bg-border/40 rounded" />
          </div>
          <div className="w-16 h-4 bg-border/40 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="w-full h-3 bg-border/40 rounded" />
          <div className="w-5/6 h-3 bg-border/40 rounded" />
          <div className="w-4/5 h-3 bg-border/40 rounded" />
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return null; // Fail gracefully: do not show panel if API fails or no data
  }

  const pStatus = insights.providerStatus || {
    openai: "not_configured",
    claude: "not_configured",
    gemini: "not_configured"
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 glow-shadow space-y-5 border border-border/50 animate-in fade-in duration-300">
      {/* Panel Header */}
      <div className="flex justify-between items-start border-b border-border/30 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <h3 className="text-xs font-bold tracking-wider text-primary uppercase">
            Executive Compensation Briefing
          </h3>
        </div>
        <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-full tracking-widest bg-[rgba(255,255,255,0.05)] text-accent border border-border/20 uppercase">
          {insights.provider === "local-fallback" ? "LOCAL ANALYST" : "AI ENGINE"}
        </span>
      </div>

      {/* Summary Paragraph */}
      <p className="text-xs text-primary leading-relaxed">
        {insights.summary}
      </p>

      {/* Observations & Anomalies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Observations list */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Market Observations
          </h4>
          <ul className="space-y-1.5 text-xs text-accent">
            {insights.observations.map((obs, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-primary font-bold select-none mt-0.5">•</span>
                <span>{obs}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Anomalies/Risks list */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Anomalies & Risk Factors
          </h4>
          <ul className="space-y-1.5 text-xs text-accent">
            {insights.anomalies.map((anom, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-amber-500 font-bold select-none mt-0.5">•</span>
                <span>{anom}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendation block */}
      <div className="p-3.5 bg-[rgba(255,255,255,0.01)] border border-border/30 rounded-xl space-y-1 mt-1">
        <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-primary" />
          Negotiation Advisory
        </h4>
        <p className="text-xs text-accent leading-relaxed">
          {insights.recommendation}
        </p>
      </div>

      {/* AI Engine Status Footnote */}
      <div className="border-t border-border/30 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[9px] text-accent">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1">
            <Info className="w-3 h-3 text-accent shrink-0" />
            Provider Engine:
          </span>
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${pStatus.openai === "active" ? "bg-emerald-500" : "bg-neutral-600"}`} />
            OpenAI ({pStatus.openai === "active" ? "Active" : "Not Configured"})
          </span>
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${pStatus.claude === "active" ? "bg-emerald-500" : "bg-neutral-600"}`} />
            Claude ({pStatus.claude === "active" ? "Active" : "Not Configured"})
          </span>
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${pStatus.gemini === "active" ? "bg-emerald-500" : "bg-neutral-600"}`} />
            Gemini ({pStatus.gemini === "active" ? "Active" : "Not Configured"})
          </span>
        </div>
        <span className="font-semibold uppercase tracking-wider text-[8px] opacity-75">
          Active: {insights.provider.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
