"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in boundary:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="glass-panel rounded-2xl p-6 glow-shadow text-center space-y-3 border border-red-500/20 max-w-sm mx-auto my-4">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <h4 className="text-xs font-bold text-primary">Component Render Error</h4>
          <p className="text-[10px] text-accent leading-relaxed">
            An unexpected error occurred while rendering this module.
          </p>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-3.5 py-1.5 rounded-lg transition-opacity hover:opacity-90 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> RETRY LOAD
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}