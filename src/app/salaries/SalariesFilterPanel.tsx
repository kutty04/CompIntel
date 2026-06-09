"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Briefcase, BarChart, SlidersHorizontal, RotateCcw } from "lucide-react";

export default function SalariesFilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state initialized from URL search params
  const [company, setCompany] = useState(searchParams.get("company") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [role, setRole] = useState(searchParams.get("role") || "");
  const [level, setLevel] = useState(searchParams.get("level") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");

  // Sync state with URL parameter changes (e.g. search query from landing hero)
  useEffect(() => {
    setCompany(searchParams.get("company") || "");
    setLocation(searchParams.get("location") || "");
    setRole(searchParams.get("role") || "");
    setLevel(searchParams.get("level") || "");
    setSortBy(searchParams.get("sortBy") || "newest");
  }, [searchParams]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (company.trim()) params.set("company", company.trim());
    if (location) params.set("location", location);
    if (role) params.set("role", role);
    if (level) params.set("level", level);
    if (sortBy) params.set("sortBy", sortBy);
    params.set("page", "1"); // Reset page on filter

    router.push(`/salaries?${params.toString()}`);
  };

  const handleReset = () => {
    setCompany("");
    setLocation("");
    setRole("");
    setLevel("");
    setSortBy("newest");
    router.push("/salaries");
  };

  const locations = ["Bangalore", "Hyderabad", "Chennai", "Pune", "Remote"];
  const roles = ["Software Engineer", "Product Manager", "Data Scientist", "UX Designer"];
  const levels = ["L3", "L4", "L5", "L6"];

  return (
    <div className="glass-panel rounded-xl p-5 glow-shadow space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-xs font-bold tracking-wider text-primary flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          FILTER EXPLORER
        </h3>
        <button
          onClick={handleReset}
          className="text-[10px] font-bold text-accent hover:text-primary flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Company Text Input */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
          <Search className="w-3 h-3" /> Company
        </label>
        <input
          type="text"
          placeholder="Filter by company name..."
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent"
        />
      </div>

      {/* Role Selector */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
          <Briefcase className="w-3 h-3" /> Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-2.5 py-2 text-xs text-primary focus:outline-none focus:border-accent"
        >
          <option value="" className="bg-background">All Roles</option>
          {roles.map(r => (
            <option key={r} value={r} className="bg-background">{r}</option>
          ))}
        </select>
      </div>

      {/* Level Selector */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
          <BarChart className="w-3 h-3" /> Level
        </label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-2.5 py-2 text-xs text-primary focus:outline-none focus:border-accent"
        >
          <option value="" className="bg-background">All Levels</option>
          {levels.map(l => (
            <option key={l} value={l} className="bg-background">{l}</option>
          ))}
        </select>
      </div>

      {/* Location Selector */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Location
        </label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-2.5 py-2 text-xs text-primary focus:outline-none focus:border-accent"
        >
          <option value="" className="bg-background">All Locations</option>
          {locations.map(loc => (
            <option key={loc} value={loc} className="bg-background">{loc}</option>
          ))}
        </select>
      </div>

      {/* Sort Selector */}
      <div className="space-y-1 border-t border-border pt-3">
        <label className="text-[10px] font-bold text-accent uppercase tracking-wider">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-2.5 py-2 text-xs text-primary focus:outline-none focus:border-accent"
        >
          <option value="newest" className="bg-background">Newest</option>
          <option value="tc-desc" className="bg-background">Highest Total Comp</option>
          <option value="base-desc" className="bg-background">Highest Base Salary</option>
          <option value="company-asc" className="bg-background">Company Name</option>
        </select>
      </div>

      <button
        onClick={handleApplyFilters}
        className="w-full bg-primary text-primary-foreground font-extrabold py-2.5 rounded-lg text-xs tracking-wider transition-all hover:opacity-90 active:scale-98 cursor-pointer mt-2"
      >
        APPLY FILTERS
      </button>
    </div>
  );
}
