"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Shield, LayoutDashboard, Search, BarChart3, PlusCircle, BookOpen, LogIn, LogOut, User } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");

  const openAuth = (tab: "signin" | "signup") => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Explorer", href: "/salaries", icon: Search },
    { label: "Compare", href: "/compare", icon: BarChart3 },
    { label: "Submit", href: "/submit", icon: PlusCircle },
    { label: "Research", href: "/research", icon: BookOpen }
  ];

  return (
    <header className="sticky top-0 w-full z-40 border-b border-border bg-[rgba(var(--background),0.4)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-95">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black tracking-tighter text-base shadow-lg shadow-glow">
            CI
          </div>
          <span className="font-extrabold tracking-tight text-lg text-primary">
            Comp<span className="text-accent font-medium">Intel</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive 
                    ? "bg-[rgba(255,255,255,0.06)] text-primary" 
                    : "text-accent hover:text-primary hover:bg-[rgba(255,255,255,0.02)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <ThemeSelector />

          {status === "loading" ? (
            <div className="w-20 h-8 rounded-lg bg-border/20 animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all border border-border ${
                  pathname === "/profile" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-primary hover:bg-[rgba(255,255,255,0.05)]"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{session.user?.name || "Profile"}</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 text-accent hover:text-primary transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAuth("signin")}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-primary transition-all hover:bg-[rgba(255,255,255,0.05)] cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuth("signup")}
                className="bg-primary text-primary-foreground font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all hover:opacity-90 cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal Container */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
      />
    </header>
  );
}
