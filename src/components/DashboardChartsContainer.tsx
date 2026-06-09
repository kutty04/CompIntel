"use client";

import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../lib/utils";
import { BarChart3, MapPin, Layers } from "lucide-react";
import { useResolvedColors } from "../lib/useResolvedColors";

interface ChartItem {
  name: string;
  base: number;
  bonus: number;
  stock: number;
  total: number;
}

interface DashboardChartsContainerProps {
  companyData: ChartItem[];
  locationData: ChartItem[];
  levelData: ChartItem[];
}

export default function DashboardChartsContainer({
  companyData,
  locationData,
  levelData
}: DashboardChartsContainerProps) {
  const [activeTab, setActiveTab] = useState<"company" | "location" | "level">("company");
  const colors = useResolvedColors();

  const getActiveData = () => {
    if (activeTab === "location") return locationData;
    if (activeTab === "level") return levelData;
    return companyData;
  };

  const getActiveTitle = () => {
    if (activeTab === "location") return "Global Locations Compensation Benchmark";
    if (activeTab === "level") return "Normalized Career Levels Benchmark";
    return "Top Technology Organizations Pay Scale (L5 Averages)";
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 glow-shadow space-y-6">
      
      {/* Tabs Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h2 className="text-sm font-bold tracking-wider text-accent uppercase">{getActiveTitle()}</h2>
          <p className="text-xs text-accent mt-0.5">Average base, performance bonus, and equity splits</p>
        </div>

        <div className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.02)] border border-border p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("company")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "company"
                ? "bg-primary text-primary-foreground shadow"
                : "text-accent hover:text-primary"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Companies
          </button>
          <button
            onClick={() => setActiveTab("location")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "location"
                ? "bg-primary text-primary-foreground shadow"
                : "text-accent hover:text-primary"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Locations
          </button>
          <button
            onClick={() => setActiveTab("level")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "level"
                ? "bg-primary text-primary-foreground shadow"
                : "text-accent hover:text-primary"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Levels
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={getActiveData()}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke={colors.accent} 
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: colors.border }}
            />
            <YAxis 
              stroke={colors.accent} 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                background: colors.border === "#cbd5e1" ? "rgba(255, 255, 255, 0.95)" : "rgba(20, 20, 23, 0.95)",
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                color: colors.foreground,
                fontSize: "12px"
              }}
              formatter={(value: any, name: string) => [formatCurrency(value), name.toUpperCase()]}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", color: colors.accent }}
            />
            <Bar dataKey="base" name="Base Salary" stackId="a" fill={colors.chartPrimary} />
            <Bar dataKey="bonus" name="Bonus" stackId="a" fill={colors.chartTertiary} />
            <Bar dataKey="stock" name="Stock Value" stackId="a" fill={colors.chartSecondary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}