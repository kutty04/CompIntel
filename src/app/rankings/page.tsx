"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatNumber } from "../../lib/utils";
import { calculateMedianCompensation } from "../../lib/analytics";
import { Trophy, ArrowLeft, Filter, Search, Award, TrendingUp, DollarSign } from "lucide-react";
import Link from "next/link";

interface SalaryEntry {
  id: string;
  role: string;
  level: string;
  location: string;
  baseSalary: number;
  bonus: number;
  stock: number;
  totalCompensation: number;
  company: {
    name: string;
  };
}

type TabType = "companies" | "locations" | "levels" | "roles" | "bonus" | "stock";

export default function RankingsPage() {
  const [entries, setEntries] = useState<SalaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("companies");
  
  // Filters
  const [filterCompany, setFilterCompany] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterRole, setFilterRole] = useState("");

  useEffect(() => {
    async function loadSalaries() {
      try {
        const res = await fetch("/api/salaries?limit=2000");
        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries || []);
        }
      } catch (err) {
        console.error("Failed to load salaries for rankings", err);
      } finally {
        setLoading(false);
      }
    }
    loadSalaries();
  }, []);

  // Compute options for filters dynamically from entries
  const companyOptions = Array.from(new Set(entries.map(e => e.company.name))).sort();
  const locationOptions = Array.from(new Set(entries.map(e => e.location))).sort();
  const levelOptions = Array.from(new Set(entries.map(e => e.level.toUpperCase()))).sort();
  const roleOptions = Array.from(new Set(entries.map(e => e.role))).sort();

  // 1. Filter entries first
  const filteredEntries = entries.filter(e => {
    if (filterCompany && e.company.name.toLowerCase() !== filterCompany.toLowerCase()) return false;
    if (filterLocation && e.location.toLowerCase() !== filterLocation.toLowerCase()) return false;
    if (filterLevel && e.level.toUpperCase() !== filterLevel.toUpperCase()) return false;
    if (filterRole && e.role.toLowerCase() !== filterRole.toLowerCase()) return false;
    return true;
  });

  // Calculate platform median from ALL entries
  const platformMedian = calculateMedianCompensation(entries.map(e => e.totalCompensation)) || 1;

  // 2. Group and aggregate based on activeTab
  const getRankings = () => {
    const groups: Record<string, { total: number; base: number; bonus: number; stock: number; count: number }> = {};

    filteredEntries.forEach(e => {
      let key = "";
      if (activeTab === "companies") key = e.company.name;
      else if (activeTab === "locations") key = e.location;
      else if (activeTab === "levels") key = e.level.toUpperCase();
      else if (activeTab === "roles") key = e.role;
      else if (activeTab === "bonus") key = e.company.name; // average bonus by company
      else if (activeTab === "stock") key = e.company.name; // average stock by company
      
      if (!groups[key]) {
        groups[key] = { total: 0, base: 0, bonus: 0, stock: 0, count: 0 };
      }
      
      groups[key].total += e.totalCompensation;
      groups[key].base += e.baseSalary;
      groups[key].bonus += e.bonus;
      groups[key].stock += e.stock;
      groups[key].count += 1;
    });

    const list = Object.entries(groups).map(([name, stats]) => {
      const count = stats.count;
      const avgTotal = stats.total / count;
      const avgBase = stats.base / count;
      const avgBonus = stats.bonus / count;
      const avgStock = stats.stock / count;

      // Select target value based on activeTab
      let value = avgTotal;
      if (activeTab === "bonus") value = avgBonus;
      else if (activeTab === "stock") value = avgStock;

      const diff = ((avgTotal - platformMedian) / platformMedian) * 100;

      return {
        name,
        value: Math.round(value),
        avgTotal: Math.round(avgTotal),
        avgBase: Math.round(avgBase),
        avgBonus: Math.round(avgBonus),
        avgStock: Math.round(avgStock),
        diff: Math.round(diff * 10) / 10,
        count
      };
    });

    // Sort descending by value
    return list.sort((a, b) => b.value - a.value);
  };

  const rankings = getRankings();
  const topValue = rankings.length > 0 ? rankings[0].value : 1;

  const tabs = [
    { id: "companies", label: "Companies" },
    { id: "locations", label: "Locations" },
    { id: "levels", label: "Levels" },
    { id: "roles", label: "Roles" },
    { id: "bonus", label: "Avg Bonus" },
    { id: "stock", label: "Avg Stock" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-primary flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500 animate-bounce" />
          Compensation Leaderboards & Rankings
        </h1>
        <p className="text-xs text-accent mt-1">
          Explore and benchmark top-paying companies, locations, levels, and compensation structures globally.
        </p>
      </div>

      {/* Filters bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 glow-shadow grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Company filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-accent uppercase">Company</label>
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-2.5 py-2 text-xs text-primary focus:outline-none focus:border-accent"
          >
            <option value="">All Companies</option>
            {companyOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Location filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-accent uppercase">Location</label>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-2.5 py-2 text-xs text-primary focus:outline-none focus:border-accent"
          >
            <option value="">All Locations</option>
            {locationOptions.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Level filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-accent uppercase">Level</label>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-2.5 py-2 text-xs text-primary focus:outline-none focus:border-accent"
          >
            <option value="">All Levels</option>
            {levelOptions.map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </div>

        {/* Role filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-accent uppercase">Role</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-2.5 py-2 text-xs text-primary focus:outline-none focus:border-accent"
          >
            <option value="">All Roles</option>
            {roleOptions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="space-y-4">
        {/* Tabs switcher */}
        <div className="flex border-b border-border overflow-x-auto pb-1 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer rounded-t-xl ${
                activeTab === tab.id
                  ? "text-primary bg-[rgba(255,255,255,0.03)] border-t border-x border-border"
                  : "text-accent hover:text-primary hover:bg-[rgba(255,255,255,0.01)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-accent">Calculating rankings metrics...</p>
          </div>
        ) : rankings.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center text-xs text-accent glow-shadow">
            No entries match the active filter criteria. Try resetting filters.
          </div>
        ) : (
          <div className="glass-panel rounded-2xl glow-shadow overflow-hidden">
            <div className="divide-y divide-border/40">
              {rankings.map((rank, index) => {
                const percentage = topValue > 0 ? (rank.value / topValue) * 100 : 0;
                const isTopThree = index < 3;
                
                return (
                  <div 
                    key={rank.name} 
                    className="p-4 sm:p-5 flex items-center justify-between gap-6 hover:bg-[rgba(255,255,255,0.01)] transition-colors"
                  >
                    {/* Rank & Name */}
                    <div className="flex items-center gap-4 min-w-[150px] sm:min-w-[200px]">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 border ${
                        index === 0 ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 text-sm" :
                        index === 1 ? "bg-slate-300/10 border-slate-300/30 text-slate-300" :
                        index === 2 ? "bg-amber-600/10 border-amber-600/30 text-amber-500" :
                        "bg-[rgba(255,255,255,0.02)] border-border/30 text-accent"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-primary flex items-center gap-1.5">
                          {rank.name}
                          {isTopThree && <Award className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" />}
                        </div>
                        <div className="text-[10px] text-accent mt-0.5">
                          Based on {rank.count} verified package{rank.count > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>

                    {/* Progress representation */}
                    <div className="hidden sm:flex flex-1 max-w-md flex-col gap-1.5">
                      <div className="w-full h-2 rounded-full bg-[rgba(255,255,255,0.03)] overflow-hidden border border-border/30">
                        <div 
                          className="h-full bg-primary transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-accent">
                        <span>Base: {formatCurrency(rank.avgBase)}</span>
                        <span>Stock: {formatCurrency(rank.avgStock)}</span>
                        <span>Bonus: {formatCurrency(rank.avgBonus)}</span>
                      </div>
                    </div>

                    {/* Value details */}
                    <div className="text-right shrink-0 space-y-1">
                      <div className="text-sm font-extrabold text-primary font-mono">
                        {formatCurrency(rank.value)}
                        {activeTab !== "companies" && activeTab !== "locations" && activeTab !== "levels" && activeTab !== "roles" && (
                          <span className="block text-[8px] text-accent uppercase font-sans mt-0.5">
                            Total: {formatCurrency(rank.avgTotal)}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
                        rank.diff >= 0
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        {rank.diff >= 0 ? "+" : ""}{rank.diff}% vs Median
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}