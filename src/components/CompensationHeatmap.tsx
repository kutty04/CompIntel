"use client";

import React from "react";
import { formatCurrency } from "../lib/utils";

interface CompensationHeatmapProps {
  entries: any[];
}

export default function CompensationHeatmap({ entries }: CompensationHeatmapProps) {
  const levels = ["L3", "L4", "L5", "L6"];
  const locations = ["Bangalore", "Hyderabad", "Chennai", "Pune", "Remote"];

  // Compute matrix averages
  const matrix: Record<string, Record<string, { avg: number; count: number }>> = {};
  
  levels.forEach(lvl => {
    matrix[lvl] = {};
    locations.forEach(loc => {
      matrix[lvl][loc] = { avg: 0, count: 0 };
    });
  });

  let maxVal = 0;
  let minVal = Infinity;

  entries.forEach(e => {
    const lvl = e.level.toUpperCase();
    const loc = e.location;
    
    if (matrix[lvl] && matrix[lvl][loc]) {
      const cell = matrix[lvl][loc];
      const currentSum = cell.avg * cell.count;
      cell.count += 1;
      cell.avg = Math.round((currentSum + e.totalCompensation) / cell.count);
      
      if (cell.avg > maxVal) maxVal = cell.avg;
      if (cell.avg < minVal && cell.avg > 0) minVal = cell.avg;
    }
  });

  if (minVal === Infinity) minVal = 0;

  // Function to calculate cell background intensity
  const getCellBgStyle = (val: number) => {
    if (val === 0) return { backgroundColor: "rgba(255,255,255,0.02)", color: "var(--accent)" };
    
    // Normalise between 0.1 and 0.8 opacity
    const range = maxVal - minVal;
    const norm = range > 0 ? (val - minVal) / range : 0.5;
    const opacity = 0.15 + norm * 0.65;
    
    return {
      backgroundColor: `rgba(59, 130, 246, ${opacity})`,
      color: opacity > 0.5 ? "#ffffff" : "var(--foreground)",
      textShadow: opacity > 0.5 ? "0 1px 2px rgba(0,0,0,0.5)" : "none"
    };
  };

  return (
    <div className="glass-panel rounded-xl p-5 glow-shadow space-y-4 overflow-hidden">
      <div>
        <h3 className="text-xs font-bold tracking-wider text-accent uppercase">Compensation Density Heatmap</h3>
        <p className="text-[10px] text-accent mt-0.5">Average total compensation (USD/yr) grouped by levels and locations</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-border text-[9px] font-bold text-accent uppercase tracking-wider">
              <th className="py-2.5 px-2 text-left w-24">Level</th>
              {locations.map(loc => (
                <th key={loc} className="py-2.5 px-2">{loc}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs">
            {levels.map(lvl => (
              <tr key={lvl}>
                <td className="py-3 px-2 text-left font-bold text-primary">{lvl} Equivalent</td>
                {locations.map(loc => {
                  const cell = matrix[lvl][loc];
                  const style = getCellBgStyle(cell.avg);
                  return (
                    <td key={loc} className="p-1">
                      <div 
                        className="py-3 px-2 rounded-lg font-mono font-semibold transition-all hover:scale-[1.02] hover:shadow-md cursor-help flex flex-col justify-center items-center h-12"
                        style={style}
                        title={cell.avg > 0 ? `Based on ${cell.count} verification entries` : "No data verified"}
                      >
                        {cell.avg > 0 ? (
                          <>
                            <span className="text-xs font-bold">{formatCurrency(cell.avg)}</span>
                            <span className="text-[8px] opacity-75 mt-0.5">{cell.count} verified</span>
                          </>
                        ) : (
                          <span className="text-[10px] opacity-40">-</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}