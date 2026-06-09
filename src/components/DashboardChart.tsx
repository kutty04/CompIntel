"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../lib/utils";
import { useResolvedColors } from "../lib/useResolvedColors";

interface DashboardChartProps {
  data: {
    name: string;
    base: number;
    bonus: number;
    stock: number;
    total: number;
  }[];
}

export default function DashboardChart({ data }: DashboardChartProps) {
  const colors = useResolvedColors();

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
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
              boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.15)",
              color: colors.foreground,
              fontSize: "12px"
            }}
            formatter={(value: any, name: string) => [formatCurrency(value), name.toUpperCase()]}
            labelStyle={{ fontWeight: "bold", color: colors.primary }}
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", color: colors.accent }}
          />
          <Bar dataKey="base" name="Base Salary" stackId="a" fill={colors.chartPrimary} radius={[0, 0, 0, 0]} />
          <Bar dataKey="bonus" name="Bonus" stackId="a" fill={colors.chartTertiary} radius={[0, 0, 0, 0]} />
          <Bar dataKey="stock" name="Stock Value" stackId="a" fill={colors.chartSecondary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}