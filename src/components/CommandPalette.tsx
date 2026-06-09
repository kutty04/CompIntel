"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Globe, Scale, ArrowUp, PlusCircle, LayoutDashboard, Database, HelpCircle, History, X, Compass, MapPin, Award } from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface CommandItem {
  title: string;
  href: string;
  icon: any;
  category: "Navigation" | "Companies" | "Locations" | "Roles" | "Levels" | "History";
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [recentSearches, setRecentSearches] = useState<{ title: string; href: string }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch companies for searching
  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetch("/api/companies");
        if (res.ok) {
          const data = await res.json();
          setCompanies(data);
        }
      } catch (err) {
        console.error("Failed to load companies in command palette", err);
      }
    }
    loadCompanies();
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const history = localStorage.getItem("compintel-recent-searches");
        if (history) {
          setRecentSearches(JSON.parse(history));
        }
      } catch (e) {
        console.error("Failed to load search history", e);
      }
    }
  }, [isOpen]);

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Static options
  const pages: CommandItem[] = [
    { title: "Dashboard", href: "/", icon: LayoutDashboard, category: "Navigation" },
    { title: "Salaries Explorer", href: "/salaries", icon: Database, category: "Navigation" },
    { title: "Side-by-Side Compare", href: "/compare", icon: Scale, category: "Navigation" },
    { title: "Submit Anonymous Salary", href: "/submit", icon: PlusCircle, category: "Navigation" },
    { title: "Am I Underpaid? Insights", href: "/insights", icon: HelpCircle, category: "Navigation" },
    { title: "Compensation Leaderboards", href: "/rankings", icon: Award, category: "Navigation" },
    { title: "Reviewer Walkthrough Tour", href: "/demo", icon: Compass, category: "Navigation" }
  ];

  const locations: CommandItem[] = ["Bangalore", "Hyderabad", "Chennai", "Pune", "Remote"].map(loc => ({
    title: `${loc} Salaries`,
    href: `/salaries?location=${loc}`,
    icon: MapPin,
    category: "Locations"
  }));

  const roles: CommandItem[] = ["Software Engineer", "Product Manager", "Data Scientist", "UX Designer"].map(role => ({
    title: `${role} Salaries`,
    href: `/salaries?role=${encodeURIComponent(role)}`,
    icon: Search,
    category: "Roles"
  }));

  const levels: CommandItem[] = ["L3", "L4", "L5", "L6"].map(lvl => ({
    title: `${lvl} Equivalent Salaries`,
    href: `/salaries?level=${lvl}`,
    icon: Award,
    category: "Levels"
  }));

  const companyItems: CommandItem[] = companies.map(c => ({
    title: `${c.name} Profile`,
    href: `/company/${c.id}`,
    icon: Globe,
    category: "Companies"
  }));

  // Build options list
  let results: CommandItem[] = [];

  if (query.trim() === "") {
    // If empty query, show recent searches + navigation links
    const historyItems: CommandItem[] = recentSearches.slice(0, 5).map(h => ({
      title: h.title,
      href: h.href,
      icon: History,
      category: "History"
    }));
    results = [...historyItems, ...pages];
  } else {
    // Fuzzy filter all categories
    const filterFn = (item: CommandItem) => 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.category.toLowerCase().includes(query.toLowerCase());

    results = [
      ...pages.filter(filterFn),
      ...companyItems.filter(filterFn),
      ...locations.filter(filterFn),
      ...roles.filter(filterFn),
      ...levels.filter(filterFn)
    ];
  }

  const handleSelect = (item: CommandItem) => {
    // Save to history (avoid duplicates and cap at 10 items)
    const newHistory = [
      { title: item.title, href: item.href },
      ...recentSearches.filter(h => h.href !== item.href)
    ].slice(0, 10);
    
    try {
      localStorage.setItem("compintel-recent-searches", JSON.stringify(newHistory));
    } catch (e) {
      console.error(e);
    }

    router.push(item.href);
    setIsOpen(false);
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.removeItem("compintel-recent-searches");
      setRecentSearches([]);
      setSelectedIndex(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-[15vh] animate-in fade-in duration-200 no-print"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="glass-panel w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-border/40 flex flex-col glow-shadow animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center border-b border-border/50 px-4 py-3 bg-[rgba(255,255,255,0.01)]">
          <Search className="w-5 h-5 text-accent mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search roles, locations, levels... (Ctrl+K to toggle)"
            className="w-full bg-transparent text-primary text-sm focus:outline-none placeholder-accent"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            {recentSearches.length > 0 && query.trim() === "" && (
              <button 
                onClick={handleClearHistory}
                className="text-[9px] font-bold text-accent hover:text-red-400 transition-colors uppercase cursor-pointer mr-1.5"
                title="Clear Search History"
              >
                Clear History
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 bg-[rgba(255,255,255,0.05)] border border-border/40 px-2 py-0.5 rounded text-[10px] font-mono text-accent">
              <span>ESC</span>
            </kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[320px] overflow-y-auto p-2 space-y-1">
          {results.length > 0 ? (
            results.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-[rgba(255,255,255,0.08)] text-primary" 
                      : "text-accent hover:text-primary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isSelected ? "text-primary" : "text-accent"}`} />
                    <span>{item.title}</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-accent opacity-60">
                    {item.category}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-accent">
              No results found for "{query}"
            </div>
          )}
        </div>

        {/* Footer help */}
        <div className="border-t border-border/30 px-4 py-2 bg-[rgba(255,255,255,0.01)] flex justify-between items-center text-[10px] text-accent">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-0.5 border border-border/30 px-1.5 py-0.5 rounded bg-[rgba(0,0,0,0.1)]">
              <ArrowUp className="w-2.5 h-2.5 rotate-180" /> Down
            </span>
            <span className="flex items-center gap-0.5 border border-border/30 px-1.5 py-0.5 rounded bg-[rgba(0,0,0,0.1)]">
              <ArrowUp className="w-2.5 h-2.5" /> Up
            </span>
            <span className="flex items-center gap-0.5 border border-border/30 px-1.5 py-0.5 rounded bg-[rgba(0,0,0,0.1)]">
              Enter
            </span>
          </div>
          <span>Select item</span>
        </div>
      </div>
    </div>
  );
}