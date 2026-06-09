"use client";

import React from "react";
import Link from "next/link";
import { HelpCircle, PlusCircle, Search } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  type?: "search" | "database" | "profile" | "comparison";
}

export default function EmptyState({
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
  type = "database"
}: EmptyStateProps) {
  
  const renderIcon = () => {
    if (type === "search") {
      return (
        <svg className="w-12 h-12 text-accent opacity-50 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      );
    }
    if (type === "profile") {
      return (
        <svg className="w-12 h-12 text-accent opacity-50 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    }
    if (type === "comparison") {
      return (
        <svg className="w-12 h-12 text-accent opacity-50 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-12 h-12 text-accent opacity-50 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-8 text-center space-y-4 glow-shadow max-w-md mx-auto">
      <div className="p-3 bg-[rgba(255,255,255,0.02)] border border-border/40 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto">
        {renderIcon()}
      </div>
      
      <div className="space-y-1">
        <h4 className="text-sm font-extrabold text-primary">{title}</h4>
        <p className="text-xs text-accent max-w-xs mx-auto leading-relaxed">{description}</p>
      </div>

      {actionText && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90 cursor-pointer"
            >
              {actionText}
            </Link>
          ) : (
            <button
              onClick={onActionClick}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90 cursor-pointer"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}