"use client";

import React, { useState, useEffect } from "react";
import { runDataQualityScan, DataQualityReport } from "../../../lib/dataQuality";
import { Activity, AlertOctagon, CheckCircle2, ShieldAlert, AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminHealthClient() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanResult, setScanResult] = useState<DataQualityReport | null>(null);
  const [activeTab, setActiveTab] = useState<"duplicates" | "outliers" | "invalids">("duplicates");

  async function performScan() {
    setLoading(true);
    try {
      const res = await fetch("/api/salaries?limit=2000");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
        const report = runDataQualityScan(data.entries || []);
        setScanResult(report);
      }
    } catch (err) {
      console.error("Failed to fetch entries for quality scan", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    performScan();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-accent">Performing real-time data integrity scans...</p>
      </div>
    );
  }

  if (!scanResult) {
    return (
      <div className="glass-panel rounded-2xl p-10 text-center text-xs text-accent">
        Failed to compile data health scan report.
      </div>
    );
  }

  const { healthScore, totalChecked, duplicateCount, outlierCount, invalidCompCount, healthAssessment, details } = scanResult;

  const scoreColor = 
    healthAssessment === "EXCELLENT" || healthAssessment === "STABLE" ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/5" :
    healthAssessment === "WARNING" ? "text-amber-400 border-amber-500/30 bg-amber-500/5" :
    "text-red-400 border-red-500/30 bg-red-500/5";

  const assessmentIcon = 
    healthAssessment === "EXCELLENT" || healthAssessment === "STABLE" ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> :
    healthAssessment === "WARNING" ? <AlertTriangle className="w-5 h-5 text-amber-400" /> :
    <ShieldAlert className="w-5 h-5 text-red-400" />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-primary flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Data Integrity & Health Dashboard
          </h1>
          <p className="text-xs text-accent mt-1">
            Real-time quality metrics, outlier scans, and duplicate validation tracking.
          </p>
        </div>
        
        <button
          onClick={performScan}
          className="glass-panel flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-primary hover:bg-[rgba(255,255,255,0.05)] cursor-pointer border border-border"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          RE-RUN SCAN
        </button>
      </div>

      {/* Health Score Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Ring */}
        <div className={`glass-panel rounded-2xl p-6 glow-shadow flex flex-col items-center justify-center text-center border ${scoreColor}`}>
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Platform Health Score</div>
          <div className="text-5xl font-black tracking-tighter">{healthScore}%</div>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold">
            {assessmentIcon}
            <span>ASSESSMENT: {healthAssessment}</span>
          </div>
        </div>

        {/* Stats breakdown */}
        <div className="glass-panel rounded-2xl p-6 glow-shadow md:col-span-2 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.015)] border border-border/40 space-y-1">
            <span className="block text-[8px] text-accent uppercase tracking-wider font-semibold">Total Audited Records</span>
            <span className="text-xl font-extrabold text-primary font-mono">{totalChecked}</span>
          </div>
          <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.015)] border border-border/40 space-y-1">
            <span className="block text-[8px] text-accent uppercase tracking-wider font-semibold">Duplicates Detected</span>
            <span className={`text-xl font-extrabold font-mono ${duplicateCount > 0 ? "text-amber-400" : "text-primary"}`}>{duplicateCount}</span>
          </div>
          <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.015)] border border-border/40 space-y-1">
            <span className="block text-[8px] text-accent uppercase tracking-wider font-semibold">Statistical Outliers (&gt;4&sigma;)</span>
            <span className={`text-xl font-extrabold font-mono ${outlierCount > 0 ? "text-red-400" : "text-primary"}`}>{outlierCount}</span>
          </div>
          <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.015)] border border-border/40 space-y-1">
            <span className="block text-[8px] text-accent uppercase tracking-wider font-semibold">Invalid Comp Ranges</span>
            <span className={`text-xl font-extrabold font-mono ${invalidCompCount > 0 ? "text-red-500" : "text-primary"}`}>{invalidCompCount}</span>
          </div>
        </div>
      </div>

      {/* Details Lists */}
      <div className="space-y-4">
        {/* Tab Headers */}
        <div className="flex border-b border-border gap-1">
          <button
            onClick={() => setActiveTab("duplicates")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all cursor-pointer ${
              activeTab === "duplicates"
                ? "text-primary bg-[rgba(255,255,255,0.03)] border-t border-x border-border"
                : "text-accent hover:text-primary hover:bg-[rgba(255,255,255,0.01)]"
            }`}
          >
            Duplicates ({duplicateCount})
          </button>
          <button
            onClick={() => setActiveTab("outliers")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all cursor-pointer ${
              activeTab === "outliers"
                ? "text-primary bg-[rgba(255,255,255,0.03)] border-t border-x border-border"
                : "text-accent hover:text-primary hover:bg-[rgba(255,255,255,0.01)]"
            }`}
          >
            Outliers ({outlierCount})
          </button>
          <button
            onClick={() => setActiveTab("invalids")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all cursor-pointer ${
              activeTab === "invalids"
                ? "text-primary bg-[rgba(255,255,255,0.03)] border-t border-x border-border"
                : "text-accent hover:text-primary hover:bg-[rgba(255,255,255,0.01)]"
            }`}
          >
            Invalids ({invalidCompCount})
          </button>
        </div>

        {/* Tab Body */}
        <div className="glass-panel rounded-2xl p-5 glow-shadow space-y-3 min-h-[200px]">
          {activeTab === "duplicates" && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-accent uppercase tracking-wider">Duplicate Scan Details</h3>
              {details.duplicates.length === 0 ? (
                <p className="text-xs text-accent">No duplicate entries found in platform records.</p>
              ) : (
                <div className="space-y-2">
                  {details.duplicates.map((dup, idx) => (
                    <div key={idx} className="p-3 border border-amber-500/20 bg-amber-500/5 rounded-xl text-xs text-amber-400 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{dup}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "outliers" && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-accent uppercase tracking-wider">Statistical Outlier Details</h3>
              {details.outliers.length === 0 ? (
                <p className="text-xs text-accent">No statistical outliers detected.</p>
              ) : (
                <div className="space-y-2">
                  {details.outliers.map((out, idx) => (
                    <div key={idx} className="p-3 border border-red-500/20 bg-red-500/5 rounded-xl text-xs text-red-400 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{out}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "invalids" && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-accent uppercase tracking-wider">Invalid Comp Range Details</h3>
              {details.invalids.length === 0 ? (
                <p className="text-xs text-accent">No invalid salary records detected.</p>
              ) : (
                <div className="space-y-2">
                  {details.invalids.map((inv, idx) => (
                    <div key={idx} className="p-3 border border-red-500/20 bg-red-500/5 rounded-xl text-xs text-red-400 flex items-start gap-2">
                      <AlertOctagon className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{inv}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
