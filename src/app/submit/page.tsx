"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Shield, PlusCircle, DollarSign, Building2, MapPin, Briefcase, BarChart, CheckCircle2, AlertCircle } from "lucide-react";
import AuthModal from "../../components/AuthModal";
import { formatCurrency } from "../../lib/utils";

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("Software Engineer");
  const [level, setLevel] = useState("L3");
  const [location, setLocation] = useState("Bangalore");
  const [baseSalary, setBaseSalary] = useState<number | "">("");
  const [bonus, setBonus] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (status === "loading") {
    return (
      <div className="max-w-xl mx-auto space-y-6 animate-pulse mt-8">
        <div className="h-6 w-48 bg-border/20 rounded-md" />
        <div className="h-80 w-full bg-border/10 rounded-xl" />
      </div>
    );
  }

  // Guest State: Force Auth
  if (!session) {
    return (
      <div className="max-w-xl mx-auto mt-8 text-center space-y-6">
        <div className="glass-panel rounded-2xl p-8 sm:p-10 glow-shadow space-y-6">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-primary">Verification Required</h2>
            <p className="text-xs text-accent max-w-sm mx-auto leading-relaxed">
              To keep compensation data accurate and prevent spam, you must create a secure account or log in to submit a salary package.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => { setAuthTab("signin"); setIsAuthOpen(true); }}
              className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-primary hover:bg-[rgba(255,255,255,0.05)] cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={() => { setAuthTab("signup"); setIsAuthOpen(true); }}
              className="bg-primary text-primary-foreground font-extrabold px-5 py-2.5 rounded-xl text-xs transition-all hover:opacity-90 cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          initialTab={authTab}
        />
      </div>
    );
  }

  // Reactive TC calculation
  const cleanBase = Number(baseSalary) || 0;
  const cleanBonus = Number(bonus) || 0;
  const cleanStock = Number(stock) || 0;
  const totalComp = cleanBase + cleanBonus + cleanStock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!companyName.trim()) {
      setError("Company Name is required");
      setLoading(false);
      return;
    }
    if (cleanBase <= 0) {
      setError("Base Salary must be greater than zero");
      setLoading(false);
      return;
    }
    if (cleanBonus < 0 || cleanStock < 0) {
      setError("Bonus and stock components cannot be negative");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/salaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          role,
          level,
          location,
          baseSalary: cleanBase,
          bonus: cleanBonus,
          stock: cleanStock
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/salaries");
        }, 1500);
      } else {
        setError(data.error || "Failed to submit salary details");
      }
    } catch (err) {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const roles = ["Software Engineer", "Product Manager", "Data Scientist", "UX Designer"];
  const levels = ["L3", "L4", "L5", "L6"];
  const locations = ["Bangalore", "Hyderabad", "Chennai", "Pune", "Remote"];

  if (success) {
    return (
      <div className="max-w-xl mx-auto mt-12 text-center space-y-4">
        <div className="glass-panel rounded-2xl p-8 glow-shadow space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-xl font-extrabold text-primary">Salary Submitted Successfully!</h2>
          <p className="text-xs text-accent">
            Thank you for contributing to compensation transparency. Redirecting you to explorer...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-primary flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-primary" />
          Submit Compensation Details
        </h1>
        <p className="text-xs text-accent mt-1">
          Contributions are entirely anonymous. We never link your profile identity directly to public salary metrics.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-2.5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 sm:p-8 glow-shadow space-y-5">
        
        {/* Company Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" /> Company Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Google, Meta"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-3.5 py-2.5 text-xs text-primary focus:outline-none focus:border-accent"
          />
        </div>

        {/* Triple Select Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Role */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-2.5 py-2.5 text-xs text-primary focus:outline-none"
            >
              {roles.map(r => <option key={r} value={r} className="bg-background">{r}</option>)}
            </select>
          </div>

          {/* Level */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
              <BarChart className="w-3.5 h-3.5" /> Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-2.5 py-2.5 text-xs text-primary focus:outline-none"
            >
              {levels.map(l => <option key={l} value={l} className="bg-background">{l} Equivalent</option>)}
            </select>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-2.5 py-2.5 text-xs text-primary focus:outline-none"
            >
              {locations.map(loc => <option key={loc} value={loc} className="bg-background">{loc}</option>)}
            </select>
          </div>
        </div>

        {/* Triple Compensation Breakdown Input */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/40 pt-5">
          {/* Base */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Base Salary ($ / yr)
            </label>
            <input
              type="number"
              required
              min={1}
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 50000"
              className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-3 py-2.5 text-xs text-primary focus:outline-none focus:border-accent"
            />
          </div>

          {/* Stock */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Stock Value ($ / yr)
            </label>
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 15000"
              className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-3 py-2.5 text-xs text-primary focus:outline-none focus:border-accent"
            />
          </div>

          {/* Bonus */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Annual Bonus ($ / yr)
            </label>
            <input
              type="number"
              min={0}
              value={bonus}
              onChange={(e) => setBonus(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 5000"
              className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg px-3 py-2.5 text-xs text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Calculated Total Compensation Banner */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-border rounded-xl p-5 flex justify-between items-center mt-3 shadow-inner">
          <div>
            <div className="text-[10px] font-bold text-accent uppercase tracking-wider">Calculated Compensation</div>
            <div className="text-xs text-accent mt-0.5">Base + Annual Stock + Annual Bonus</div>
          </div>
          <div className="text-right">
            <span className="block text-[8px] text-accent uppercase tracking-wider font-semibold">Total / Year</span>
            <span className="text-xl sm:text-2xl font-black text-primary font-mono">{formatCurrency(totalComp)}</span>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground font-black py-3.5 rounded-xl text-xs sm:text-sm tracking-wider transition-all hover:opacity-90 active:scale-98 disabled:opacity-50 cursor-pointer shadow-lg shadow-glow mt-4"
        >
          {loading ? "SUBMITTING COMP DETAILS..." : "SUBMIT SALARY VERIFICATION"}
        </button>

      </form>
    </div>
  );
}
