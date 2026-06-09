"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { signIn, getProviders } from "next-auth/react";
import { X, Mail, Lock, User, AlertCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "signin" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialTab = "signin" }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function checkProviders() {
      try {
        const provs = await getProviders();
        if (provs && provs.google) {
          setGoogleEnabled(true);
        }
      } catch (err) {
        console.error("Failed to load auth providers:", err);
      }
    }
    checkProviders();
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (tab === "signin") {
      try {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false
        });

        if (res?.error) {
          setError(res.error);
        } else {
          onClose();
          window.location.reload();
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      // Sign Up Flow
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Registration failed");
          setLoading(false);
          return;
        }

        // Auto sign-in after signup
        const signInRes = await signIn("credentials", {
          email,
          password,
          redirect: false
        });

        if (signInRes?.error) {
          setError("Account created, but sign-in failed. Please log in manually.");
          setTab("signin");
        } else {
          onClose();
          window.location.reload();
        }
      } catch (err) {
        setError("Failed to create account. Please check your internet connection.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="glass-panel w-full max-w-md rounded-2xl overflow-hidden relative glow-shadow animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-accent hover:text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Tab Headers */}
          <div className="flex border-b border-border">
            <button
              onClick={() => { setTab("signin"); setError(""); }}
              className={`flex-1 py-4 text-sm font-semibold tracking-wider transition-colors cursor-pointer ${
                tab === "signin" 
                  ? "text-primary border-b-2 border-primary bg-[rgba(255,255,255,0.02)]" 
                  : "text-accent hover:text-primary hover:bg-[rgba(255,255,255,0.01)]"
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => { setTab("signup"); setError(""); }}
              className={`flex-1 py-4 text-sm font-semibold tracking-wider transition-colors cursor-pointer ${
                tab === "signup" 
                  ? "text-primary border-b-2 border-primary bg-[rgba(255,255,255,0.02)]" 
                  : "text-accent hover:text-primary hover:bg-[rgba(255,255,255,0.01)]"
              }`}
            >
              CREATE ACCOUNT
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="text-center mb-2">
              <h3 className="text-lg font-bold tracking-tight text-primary">
                {tab === "signin" ? "Welcome Back to CompIntel" : "Join Compensation Intelligence"}
              </h3>
              <p className="text-xs text-accent mt-1">
                {tab === "signin" ? "Analyze, compare and verify tech compensation levels" : "Submit salaries anonymously and track career metrics"}
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {tab === "signup" && (
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-accent uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-accent" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg pl-9 pr-4 py-2.5 text-xs text-primary focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-accent uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-accent" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg pl-9 pr-4 py-2.5 text-xs text-primary focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-semibold text-accent uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-accent" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[rgba(0,0,0,0.2)] border border-border rounded-lg pl-9 pr-4 py-2.5 text-xs text-primary focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg text-xs tracking-wider transition-all hover:opacity-90 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "PROCESSING..." : tab === "signin" ? "SIGN IN" : "REGISTER ACCOUNT"}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-[10px] text-accent font-semibold uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            {googleEnabled ? (
              <button
                type="button"
                onClick={() => signIn("google")}
                className="w-full flex items-center justify-center gap-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-border text-primary font-semibold py-2.5 rounded-lg text-xs tracking-wider transition-all active:scale-98 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.5 3.77v3.13h4.05c2.37-2.18 3.73-5.39 3.73-8.75z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.05-3.13c-1.12.75-2.55 1.19-3.88 1.19-3 0-5.54-2.03-6.44-4.76H1.42v3.25C3.39 21.56 7.42 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.56 14.39a7.18 7.18 0 0 1 0-4.78V6.36H1.42a11.98 11.98 0 0 0 0 11.28l4.14-3.25z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.42 0 3.39 2.44 1.42 6.36l4.14 3.25c.9-2.73 3.44-4.76 6.44-4.76z"
                  />
                </svg>
                CONTINUE WITH GOOGLE
              </button>
            ) : (
              <div className="w-full flex flex-col gap-1.5">
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center gap-2 bg-[rgba(255,255,255,0.02)] border border-border/40 text-accent font-semibold py-2.5 rounded-lg text-xs tracking-wider opacity-50 cursor-not-allowed"
                >
                  <svg className="w-4 h-4 opacity-40" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.5 3.77v3.13h4.05c2.37-2.18 3.73-5.39 3.73-8.75z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.05-3.13c-1.12.75-2.55 1.19-3.88 1.19-3 0-5.54-2.03-6.44-4.76H1.42v3.25C3.39 21.56 7.42 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.56 14.39a7.18 7.18 0 0 1 0-4.78V6.36H1.42a11.98 11.98 0 0 0 0 11.28l4.14-3.25z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.42 0 3.39 2.44 1.42 6.36l4.14 3.25c.9-2.73 3.44-4.76 6.44-4.76z"
                    />
                  </svg>
                  CONTINUE WITH GOOGLE
                </button>
                <p className="text-[9px] text-center text-accent/80 mt-1 leading-normal">
                  Google Sign-In is not configured in this environment.
                </p>
              </div>
            )}

            {tab === "signin" && (
              <div className="text-center pt-2">
                <span className="text-xs text-accent">Demo Account: </span>
                <span className="text-xs text-primary font-mono select-all">admin@compintel.com</span>
                <span className="text-xs text-accent"> / </span>
                <span className="text-xs text-primary font-mono select-all">adminpassword123</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
