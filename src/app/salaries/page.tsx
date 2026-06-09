import React from "react";
import Link from "next/link";
import { dataService } from "../../services/dataService";
import SalariesFilterPanel from "./SalariesFilterPanel";
import { formatCurrency, formatNumber } from "../../lib/utils";
import { ChevronLeft, ChevronRight, SlidersHorizontal, Search, User } from "lucide-react";

export const revalidate = 0; // Dynamic server component

interface PageProps {
  searchParams: Promise<{
    company?: string;
    location?: string;
    role?: string;
    level?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export default async function SalariesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // Resolve filters with defaults
  const page = parseInt(params.page || "1") || 1;
  const limit = 15;
  
  const query = {
    company: params.company,
    location: params.location,
    role: params.role,
    level: params.level,
    sortBy: params.sortBy || "newest",
    page,
    limit
  };

  const result = await dataService.getSalaries(query);

  // Helper to construct paginated links preserving existing filter states
  function getPageUrl(pageNum: number) {
    const urlParams = new URLSearchParams();
    if (params.company) urlParams.set("company", params.company);
    if (params.location) urlParams.set("location", params.location);
    if (params.role) urlParams.set("role", params.role);
    if (params.level) urlParams.set("level", params.level);
    if (params.sortBy) urlParams.set("sortBy", params.sortBy);
    urlParams.set("page", pageNum.toString());
    return `/salaries?${urlParams.toString()}`;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-primary">Compensation Explorer</h1>
        <p className="text-xs text-accent mt-1">
          Explore and filter real-time salaries across tech companies, leveled to normalize comparisons.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <SalariesFilterPanel />
        </div>

        {/* Main List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel rounded-xl p-4 sm:p-5 glow-shadow">
            
            {/* Header info */}
            <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
              <div className="text-xs text-accent font-semibold">
                SHOWING <span className="text-primary">{result.items.length}</span> OF <span className="text-primary">{formatNumber(result.total)}</span> VERIFIED PACKAGES
              </div>
              <div className="text-xs text-accent">
                Page <span className="text-primary">{result.page}</span> of <span className="text-primary">{result.totalPages || 1}</span>
              </div>
            </div>

            {/* Empty State */}
            {result.items.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <SlidersHorizontal className="w-8 h-8 text-accent mx-auto opacity-40 animate-pulse" />
                <h4 className="text-sm font-bold text-primary">No results match your criteria</h4>
                <p className="text-xs text-accent max-w-xs mx-auto">
                  Try widening your filter selectors or search query to find relevant submissions.
                </p>
                <Link
                  href="/salaries"
                  className="inline-block text-xs font-bold text-primary border border-border px-4 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.03)] mt-2"
                >
                  CLEAR ALL FILTERS
                </Link>
              </div>
            ) : (
              /* Salaries Table */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-bold text-accent uppercase tracking-wider">
                      <th className="py-3 px-2">Company</th>
                      <th className="py-3 px-2">Role / Level</th>
                      <th className="py-3 px-2">Location</th>
                      <th className="py-3 px-2 text-right">Base / Stock / Bonus</th>
                      <th className="py-3 px-2 text-right">Total Compensation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-xs">
                    {result.items.map((item) => (
                      <tr key={item.id} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group">
                        <td className="py-4 px-2">
                          <Link 
                            href={`/company/${item.company.id}`} 
                            className="font-bold text-primary hover:underline hover:text-accent transition-colors flex items-center gap-2"
                          >
                            <div className="w-6 h-6 rounded-md bg-[rgba(255,255,255,0.05)] border border-border flex items-center justify-center font-bold text-[10px] text-accent group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                              {item.company.logo || item.company.name.charAt(0)}
                            </div>
                            <span>{item.company.name}</span>
                          </Link>
                        </td>
                        <td className="py-4 px-2">
                          <div className="font-semibold text-primary">{item.role}</div>
                          <div className="text-[10px] text-accent mt-0.5 font-medium">Level: {item.level}</div>
                        </td>
                        <td className="py-4 px-2 text-accent">{item.location}</td>
                        <td className="py-4 px-2 text-right text-accent font-mono">
                          {formatCurrency(item.baseSalary)} / {formatCurrency(item.stock)} / {formatCurrency(item.bonus)}
                        </td>
                        <td className="py-4 px-2 text-right font-extrabold text-primary font-mono">
                          {formatCurrency(item.totalCompensation)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {result.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
                <div>
                  {page > 1 ? (
                    <Link
                      href={getPageUrl(page - 1)}
                      className="flex items-center gap-1 px-3.5 py-2 rounded-lg border border-border text-xs font-bold text-primary hover:bg-[rgba(255,255,255,0.03)] cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>PREVIOUS</span>
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="flex items-center gap-1 px-3.5 py-2 rounded-lg border border-border text-xs font-bold text-accent opacity-30 cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>PREVIOUS</span>
                    </button>
                  )}
                </div>

                <div className="text-xs text-accent font-mono">
                  {page} / {result.totalPages}
                </div>

                <div>
                  {page < result.totalPages ? (
                    <Link
                      href={getPageUrl(page + 1)}
                      className="flex items-center gap-1 px-3.5 py-2 rounded-lg border border-border text-xs font-bold text-primary hover:bg-[rgba(255,255,255,0.03)] cursor-pointer"
                    >
                      <span>NEXT</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="flex items-center gap-1 px-3.5 py-2 rounded-lg border border-border text-xs font-bold text-accent opacity-30 cursor-not-allowed"
                    >
                      <span>NEXT</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
