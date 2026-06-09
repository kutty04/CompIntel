"use client";

import React from "react";
import { formatCurrency } from "../lib/utils";

interface PercentileDistributionProps {
  stats: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  currentComp?: number;
}

export default function PercentileDistribution({ stats, currentComp }: PercentileDistributionProps) {
  const { p25, p50, p75, p90 } = stats;

  // Determine percentage along scale if currentComp is specified
  const getPercentPosition = (val: number) => {
    const min = p25 * 0.7;
    const max = p90 * 1.2;
    if (val <= min) return 0;
    if (val >= max) return 100;
    return ((val - min) / (max - min)) * 100;
  };

  const userPos = currentComp ? getPercentPosition(currentComp) : null;

  return (
    <div className="glass-panel rounded-xl p-5 glow-shadow space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="block text-[8px] text-accent uppercase tracking-wider font-semibold">Compensation Range</span>
          <span className="text-xs font-bold text-primary">Percentile Vesting Distribution</span>
        </div>
        {currentComp && (
          <div className="text-right">
            <span className="block text-[8px] text-accent uppercase tracking-wider font-semibold">Your Package</span>
            <span className="text-xs font-bold text-primary font-mono">{formatCurrency(currentComp)}</span>
          </div>
        )}
      </div>

      {/* Visual Slider Bar */}
      <div className="relative pt-6 pb-2">
        <div className="h-1.5 w-full bg-[rgba(255,255,255,0.05)] border border-border rounded-full relative">
          
          {/* Accent Line connecting P25 and P90 */}
          <div 
            className="absolute h-full bg-blue-500/30 rounded-full"
            style={{ left: "15%", right: "10%" }}
          />

          {/* Markers */}
          {/* P25 */}
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 border border-background shadow" style={{ left: "15%" }} title={`P25: ${formatCurrency(p25)}`} />
          
          {/* Median */}
          <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background shadow-lg shadow-glow" style={{ left: "50%" }} title={`Median: ${formatCurrency(p50)}`} />
          
          {/* P75 */}
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-500 border border-background shadow" style={{ left: "75%" }} title={`P75: ${formatCurrency(p75)}`} />
          
          {/* P90 */}
          <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-red-500 border border-background shadow" style={{ left: "90%" }} title={`P90: ${formatCurrency(p90)}`} />

          {/* User Value Pin */}
          {userPos !== null && (
            <div 
              className="absolute -top-3 -translate-y-full -translate-x-1/2 flex flex-col items-center z-10 animate-bounce duration-1000"
              style={{ left: `${userPos}%` }}
            >
              <div className="bg-primary text-primary-foreground text-[9px] font-black px-2 py-0.5 rounded shadow-lg border border-border font-mono whitespace-nowrap">
                YOU ({formatCurrency(currentComp!)})
              </div>
              <div className="w-1.5 h-1.5 bg-primary rotate-45 -mt-1" />
            </div>
          )}
        </div>
      </div>

      {/* Label Descriptions */}
      <div className="grid grid-cols-4 gap-1 text-center font-mono text-[9px] text-accent pt-1">
        <div>
          <span className="block text-[7px] text-accent uppercase font-sans">P25</span>
          <span className="font-semibold text-primary">{formatCurrency(p25)}</span>
        </div>
        <div>
          <span className="block text-[7px] text-accent uppercase font-sans">Median (P50)</span>
          <span className="font-semibold text-emerald-400 font-bold">{formatCurrency(p50)}</span>
        </div>
        <div>
          <span className="block text-[7px] text-accent uppercase font-sans">P75</span>
          <span className="font-semibold text-primary">{formatCurrency(p75)}</span>
        </div>
        <div>
          <span className="block text-[7px] text-accent uppercase font-sans">P90</span>
          <span className="font-semibold text-red-400">{formatCurrency(p90)}</span>
        </div>
      </div>
    </div>
  );
}