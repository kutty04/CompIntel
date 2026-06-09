"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Compass } from "lucide-react";

export default function SearchHero() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/salaries?company=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/salaries");
    }
  };

  const quickFilters = ["Google", "Meta", "Amazon", "Microsoft", "Netflix"];

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-10 glow-shadow relative overflow-hidden flex flex-col items-center text-center">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(var(--primary),0.05)_0%,transparent_70%)] -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(var(--accent),0.03)_0%,transparent_70%)] translate-y-1/2 pointer-events-none" />

      <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-primary max-w-2xl leading-none">
        Verify Compensation. <br />
        <span className="text-accent font-medium text-2xl sm:text-4xl">Levels matter more than job titles.</span>
      </h1>
      <p className="text-xs sm:text-sm text-accent max-w-lg mt-4 leading-relaxed">
        Join the anonymous compensation intelligence platform. Compare salaries, bonus distributions, and equity levels across top-tier engineering organizations.
      </p>

      {/* Search Input Form */}
      <form onSubmit={handleSearch} className="w-full max-w-xl mt-8 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-accent" />
          <input
            type="text"
            placeholder="Search salaries by company (e.g. Google)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[rgba(0,0,0,0.3)] border border-border rounded-xl pl-10 pr-4 py-3.5 text-xs sm:text-sm text-primary focus:outline-none focus:border-accent transition-colors shadow-inner"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-primary-foreground font-extrabold px-6 py-3.5 rounded-xl text-xs sm:text-sm transition-all hover:opacity-90 active:scale-98 cursor-pointer"
        >
          EXPLORE
        </button>
      </form>

      {/* Suggestion tags */}
      <div className="flex items-center flex-wrap justify-center gap-2.5 mt-5 text-xs text-accent">
        <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5" /> Popular:</span>
        {quickFilters.map((q) => (
          <button
            key={q}
            onClick={() => router.push(`/salaries?company=${encodeURIComponent(q)}`)}
            className="px-2.5 py-1 rounded-md border border-border hover:border-accent hover:text-primary transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
