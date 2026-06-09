import { useState, useEffect } from "react";
import { useTheme } from "../components/ThemeProvider";

export function useResolvedColors() {
  const { theme, accent } = useTheme();
  const [colors, setColors] = useState({
    accent: "#64748b",
    border: "#cbd5e1",
    foreground: "#0f172a",
    primary: "#2563eb",
    chartPrimary: "#3b82f6",
    chartSecondary: "#8b5cf6",
    chartTertiary: "#10b981"
  });

  useEffect(() => {
    // A small layout cycle delay ensures that custom attributes (data-theme, data-accent)
    // have updated and the browser has recalculated styles before getComputedStyle runs.
    const timer = setTimeout(() => {
      const style = getComputedStyle(document.documentElement);
      const getVal = (name: string, fallback: string) => {
        const val = style.getPropertyValue(name).trim();
        return val || fallback;
      };

      setColors({
        accent: getVal("--muted", "#64748b"),
        border: getVal("--border", "#cbd5e1"),
        foreground: getVal("--foreground", "#0f172a"),
        primary: getVal("--primary", "#2563eb"),
        chartPrimary: getVal("--chart-primary", "#3b82f6"),
        chartSecondary: getVal("--chart-secondary", "#8b5cf6"),
        chartTertiary: getVal("--chart-tertiary", "#10b981")
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [theme, accent]);

  return colors;
}