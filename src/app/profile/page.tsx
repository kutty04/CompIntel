"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatCurrency } from "../../lib/utils";
import { User, Key, Save, Database, Trash2, ArrowRight, Shield, AlertCircle, HelpCircle } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  
  // Dashboard data states
  const [submittedSalaries, setSubmittedSalaries] = useState<any[]>([]);
  const [savedComparisons, setSavedComparisons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"submissions" | "comparisons">("submissions");

  // Fetch user data
  useEffect(() => {
    if (status !== "authenticated") return;

    async function loadUserData() {
      setLoading(true);
      setError("");
      try {
        // Fetch saved comparisons
        const compRes = await fetch("/api/comparison/saved");
        let comps = [];
        if (compRes.ok) {
          comps = await compRes.json();
          setSavedComparisons(comps);
        }

        // Fetch all salaries and filter client-side for user's own submissions
        const salRes = await fetch("/api/salaries?limit=100");
        if (salRes.ok) {
          const salData = await salRes.json();
          const userSalaries = salData.items.filter(
            (item: any) => item.userId === (session?.user as any).id
          );
          setSubmittedSalaries(userSalaries);
        }
      } catch (err) {
        setError("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [status, session]);

  const handleDeleteSalary = async (id: string) => {
    if (!confirm("Are you sure you want to delete this salary submission?")) return;

    try {
      const res = await fetch(`/api/salaries/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setSubmittedSalaries(submittedSalaries.filter(s => s.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete salary entry");
      }
    } catch (err) {
      alert("An error occurred during deletion.");
    }
  };

  if (status === "loading") {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse mt-8">
        <div className="h-6 w-32 bg-border/20 rounded-md" />
        <div className="h-40 w-full bg-border/10 rounded-xl" />
      </div>
    );
  }

  // Force Auth
  if (!session) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center space-y-6">
        <div className="glass-panel rounded-2xl p-8 glow-shadow space-y-4">
          <Shield className="w-12 h-12 text-accent mx-auto opacity-50" />
          <h2 className="text-lg font-extrabold text-primary">Access Denied</h2>
          <p className="text-xs text-accent">
            Please sign in or create an account to view your user profile dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Helper to compile compare links from saved comparison arrays
  const getCompareLink = (comparison: any) => {
    const selections = comparison.comparisonData.selections;
    const params = new URLSearchParams();
    selections.forEach((sel: any, idx: number) => {
      params.set(`c${idx + 1}`, sel.companyName);
      params.set(`l${idx + 1}`, sel.level);
    });
    return `/compare?${params.toString()}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-primary">User Dashboard</h1>
        <p className="text-xs text-accent mt-1">
          Manage your anonymous salary submissions and saved company comparisons.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-2.5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Account Info Card */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 glow-shadow grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        <div className="flex items-center gap-3.5 sm:col-span-2">
          <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-lg">
            {session.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-primary leading-none">{session.user?.name}</h2>
            <p className="text-xs text-accent mt-1.5">{session.user?.email}</p>
          </div>
        </div>
        <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-border/40 pt-4 sm:pt-0 sm:pl-6">
          <span className="block text-[8px] text-accent uppercase tracking-wider font-semibold">Account Role</span>
          <span className="text-xs font-bold text-primary flex items-center gap-1.5 sm:justify-end mt-1">
            <Key className="w-3.5 h-3.5 text-blue-400" />
            Verified Member
          </span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-border/60">
        <button
          onClick={() => setTab("submissions")}
          className={`px-5 py-3 text-xs font-bold tracking-wider transition-colors cursor-pointer ${
            tab === "submissions"
              ? "text-primary border-b-2 border-primary"
              : "text-accent hover:text-primary"
          }`}
        >
          SUBMITTED SALARIES ({submittedSalaries.length})
        </button>
        <button
          onClick={() => setTab("comparisons")}
          className={`px-5 py-3 text-xs font-bold tracking-wider transition-colors cursor-pointer ${
            tab === "comparisons"
              ? "text-primary border-b-2 border-primary"
              : "text-accent hover:text-primary"
          }`}
        >
          SAVED COMPARISONS ({savedComparisons.length})
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="text-center py-12 text-xs text-accent">Loading records...</div>
      ) : tab === "submissions" ? (
        
        /* Submissions list */
        <div className="space-y-3">
          {submittedSalaries.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center space-y-3">
              <Database className="w-8 h-8 text-accent mx-auto opacity-40" />
              <h4 className="text-xs font-bold text-primary">No submissions found</h4>
              <p className="text-[10px] text-accent max-w-xs mx-auto">
                You haven't submitted any salary packages yet. Help the community by contributing.
              </p>
              <Link
                href="/submit"
                className="inline-block text-xs font-extrabold text-primary border border-border px-4 py-2 rounded-xl hover:bg-[rgba(255,255,255,0.03)] mt-2"
              >
                SUBMIT A SALARY
              </Link>
            </div>
          ) : (
            submittedSalaries.map((s) => (
              <div key={s.id} className="glass-panel rounded-xl p-4 glow-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-primary">{s.company.name}</span>
                    <span className="px-2 py-0.5 rounded-md border border-border text-[9px] text-accent font-semibold">{s.level}</span>
                  </div>
                  <div className="text-xs text-accent">
                    {s.role} � {s.location}
                  </div>
                  <div className="text-[10px] text-accent font-mono pt-1">
                    Base: {formatCurrency(s.baseSalary)} | Stock: {formatCurrency(s.stock)} | Bonus: {formatCurrency(s.bonus)}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 border-border/40 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="block text-[8px] text-accent uppercase tracking-wider font-semibold">Total Compensation</span>
                    <span className="text-sm font-extrabold text-primary font-mono">{formatCurrency(s.totalCompensation)}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteSalary(s.id)}
                    className="p-2 text-accent hover:text-red-400 transition-colors cursor-pointer border border-border rounded-lg hover:bg-[rgba(255,255,255,0.02)]"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        
        /* Saved comparisons list */
        <div className="space-y-3">
          {savedComparisons.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center space-y-3">
              <Save className="w-8 h-8 text-accent mx-auto opacity-40" />
              <h4 className="text-xs font-bold text-primary">No saved comparisons</h4>
              <p className="text-[10px] text-accent max-w-xs mx-auto">
                Compare multiple company packages in the Compare page and save them here.
              </p>
              <Link
                href="/compare"
                className="inline-block text-xs font-extrabold text-primary border border-border px-4 py-2 rounded-xl hover:bg-[rgba(255,255,255,0.03)] mt-2"
              >
                GO TO COMPARE
              </Link>
            </div>
          ) : (
            savedComparisons.map((c) => {
              const sels = c.comparisonData.selections;
              return (
                <div key={c.id} className="glass-panel rounded-xl p-4 glow-shadow flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-primary flex items-center gap-1.5 flex-wrap">
                      {sels.map((s: any, idx: number) => (
                        <React.Fragment key={idx}>
                          <span>{s.companyName} ({s.level})</span>
                          {idx < sels.length - 1 && <span className="text-accent font-medium text-[10px]">vs</span>}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="text-[10px] text-accent">
                      Saved on {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <Link
                    href={getCompareLink(c)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-primary hover:bg-[rgba(255,255,255,0.03)]"
                  >
                    <span>Load</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}
