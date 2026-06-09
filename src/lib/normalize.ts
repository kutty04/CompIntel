export function normalizeCompanyName(name: string): string {
  if (!name) return "";
  const lower = name.toLowerCase().trim();
  
  // Explicit hardcoded normalization rules
  if (lower.startsWith("google")) return "Google";
  if (lower.startsWith("amazon")) return "Amazon";
  if (lower.startsWith("meta")) return "Meta";
  if (lower.startsWith("microsoft")) return "Microsoft";
  if (lower.startsWith("apple")) return "Apple";
  if (lower.startsWith("netflix")) return "Netflix";
  if (lower.startsWith("uber")) return "Uber";
  if (lower.startsWith("airbnb")) return "Airbnb";

  // General cleaning for other companies
  const cleaned = name
    .replace(/\b(inc|llc|corp|co|ltd|gmbh|india|usa|corporation|systems|technologies)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return name;

  return cleaned
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function calculateTotalCompensation(baseSalary: number, bonus?: number | null, stock?: number | null): number {
  if (baseSalary < 0 || (bonus !== undefined && bonus !== null && bonus < 0) || (stock !== undefined && stock !== null && stock < 0)) {
    throw new Error("Salaries and compensation cannot be negative");
  }
  if (isNaN(baseSalary) || (bonus && isNaN(bonus)) || (stock && isNaN(stock))) {
    throw new Error("Compensation values must be valid numbers");
  }
  const cleanBonus = bonus || 0;
  const cleanStock = stock || 0;
  return baseSalary + cleanBonus + cleanStock;
}

/**
 * Normalizes input job levels to a standardized leveling scale (L3 to L6).
 * Fallback preserves the original string trimmed if no reliable mapping is found.
 */
export function normalizeLevelName(level: string, companyName?: string): string {
  if (!level) return "";
  const cleanLevel = level.trim().toUpperCase();
  const cleanCompany = companyName ? companyName.trim().toLowerCase() : "";

  // 1. Direct matches
  if (cleanLevel === "L3" || cleanLevel === "L4" || cleanLevel === "L5" || cleanLevel === "L6") {
    return cleanLevel;
  }

  // 2. Meta levels (E3, E4, E5, E6, IC3, IC4, IC5, IC6, D3, D4, D5, D6)
  if (/^(E|IC|D)[3-6]$/i.test(cleanLevel)) {
    const match = cleanLevel.match(/[3-6]/);
    if (match) return "L" + match[0];
  }

  // 3. Company specific mappings if company is known or in level string
  const lowerLevel = level.toLowerCase();
  
  // Amazon mappings
  if (cleanCompany.includes("amazon") || lowerLevel.includes("amazon")) {
    if (lowerLevel.includes("sde i") || lowerLevel.includes("sde 1") || lowerLevel.includes("sdei")) return "L3";
    if (lowerLevel.includes("sde ii") || lowerLevel.includes("sde 2") || lowerLevel.includes("sdeii")) return "L4";
    if (lowerLevel.includes("sde iii") || lowerLevel.includes("sde 3") || lowerLevel.includes("sdeiii") || lowerLevel.includes("senior sde")) return "L5";
    if (lowerLevel.includes("principal")) return "L6";
  }

  // Google mappings
  if (cleanCompany.includes("google") || lowerLevel.includes("google")) {
    if (lowerLevel.includes("l3")) return "L3";
    if (lowerLevel.includes("l4")) return "L4";
    if (lowerLevel.includes("l5")) return "L5";
    if (lowerLevel.includes("l6") || lowerLevel.includes("staff")) return "L6";
  }

  // Microsoft mappings
  if (cleanCompany.includes("microsoft") || lowerLevel.includes("microsoft")) {
    if (lowerLevel.includes("grade 7") || lowerLevel.includes("59") || lowerLevel.includes("60")) return "L3";
    if (lowerLevel.includes("grade 8") || lowerLevel.includes("61") || lowerLevel.includes("62")) return "L4";
    if (lowerLevel.includes("grade 9") || lowerLevel.includes("63") || lowerLevel.includes("64")) return "L5";
    if (lowerLevel.includes("partner") || lowerLevel.includes("65") || lowerLevel.includes("66")) return "L6";
  }

  // General substring match fallbacks (for cases where level contains raw text)
  if (lowerLevel.includes("sde i") || lowerLevel.includes("sde 1") || lowerLevel.includes("entry") || lowerLevel.includes("junior")) return "L3";
  if (lowerLevel.includes("sde ii") || lowerLevel.includes("sde 2") || lowerLevel.includes("associate")) return "L4";
  if (lowerLevel.includes("sde iii") || lowerLevel.includes("sde 3") || lowerLevel.includes("senior")) return "L5";
  if (lowerLevel.includes("principal") || lowerLevel.includes("staff") || lowerLevel.includes("director")) return "L6";

  // Generic patterns like "Grade 7" -> L4, "Grade 8" -> L5, etc.
  if (lowerLevel.includes("grade 7")) return "L4";
  if (lowerLevel.includes("grade 8")) return "L5";

  // Conservative fallback: return the original string trimmed
  return level.trim();
}
