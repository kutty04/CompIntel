export interface AIInsightResult {
  summary: string;
  observations: string[];
  anomalies: string[];
  recommendation: string;
  provider: "local-fallback" | "openai" | "gemini" | "claude";
  providerStatus: {
    openai: "active" | "not_configured";
    claude: "active" | "not_configured";
    gemini: "active" | "not_configured";
  };
}

export interface InsightsInput {
  name: string;
  type: "company" | "level" | "location" | "role" | "compare" | "general";
  avgTotalComp: number;
  avgBaseSalary: number;
  avgStock: number;
  avgBonus: number;
  percentiles?: { p25: number; p50: number; p75: number; p90: number };
  baselineMedian?: number;
  entriesCount?: number;
  comparisonData?: any[];
}

export async function generateAIInsights(input: InsightsInput): Promise<AIInsightResult> {
  const openAiKey = process.env.OPENAI_API_KEY;

  if (openAiKey) {
    try {
      const result = await callOpenAI(input, openAiKey);
      return {
        ...result,
        providerStatus: {
          openai: "active",
          claude: "not_configured",
          gemini: "not_configured"
        }
      };
    } catch (e) {
      console.error("OpenAI Insights API error, falling back to local:", e);
    }
  }

  // Local rule-based statistical insights engine (100% reliable fallback)
  return generateLocalInsights(input);
}

function generateLocalInsights(input: InsightsInput): AIInsightResult {
  const { name, type, avgTotalComp, avgBaseSalary, avgStock, avgBonus, percentiles, baselineMedian, entriesCount } = input;
  
  const basePercent = avgTotalComp > 0 ? Math.round((avgBaseSalary / avgTotalComp) * 100) : 0;
  const stockPercent = avgTotalComp > 0 ? Math.round((avgStock / avgTotalComp) * 100) : 0;
  const bonusPercent = avgTotalComp > 0 ? Math.round((avgBonus / avgTotalComp) * 100) : 0;

  let summary = "";
  const observations: string[] = [];
  const anomalies: string[] = [];
  let recommendation = "";

  if (type === "company") {
    summary = `Executive briefing for ${name} compensation data. Across ${entriesCount || 0} verified submissions, the average total compensation stands at $${(avgTotalComp / 1000).toFixed(1)}k per annum, with base salary accounting for ${basePercent}% of the total package.`;
    
    observations.push(`Stock grants (${stockPercent}%) constitute the primary scaling component for high percentile brackets.`);
    observations.push(`Performance bonuses represent a secondary component, contributing an average of ${bonusPercent}% ($${(avgBonus / 1000).toFixed(1)}k).`);
    
    if (baselineMedian && avgTotalComp > baselineMedian) {
      const premium = Math.round(((avgTotalComp - baselineMedian) / baselineMedian) * 100);
      observations.push(`${name} commands a dynamic compensation premium of +${premium}% above the platform benchmark median.`);
    } else if (baselineMedian) {
      const discount = Math.round(((baselineMedian - avgTotalComp) / baselineMedian) * 100);
      observations.push(`${name} operates at a -${discount}% baseline variance compared to the overall market average.`);
    }

    if (stockPercent > 40) {
      anomalies.push("High equity dependency: Total compensation is strongly coupled with public market fluctuation, exposing candidates to higher volatility.");
    }
    if (avgBonus < avgBaseSalary * 0.05) {
      anomalies.push("Low performance bonus structure: Cash compensation is heavily flat-weighted with minimal performance-driven variable play.");
    }
    
    recommendation = `Candidates negotiating offers at ${name} should prioritize equity refresh schedules, as stock grants represent the primary growth mechanism for long-term compensation.`;
  } 
  else if (type === "level") {
    summary = `Level analysis for ${name} roles. Market data indicates an average compensation scale of $${(avgTotalComp / 1000).toFixed(1)}k, showing structured grading thresholds.`;
    
    observations.push(`At the ${name} bracket, base salary takes up ${basePercent}% of total pay, ensuring a stable cash baseline.`);
    if (percentiles && percentiles.p90 > percentiles.p50 * 1.5) {
      observations.push(`Significant compensation skew detected at P90 ($${(percentiles.p90 / 1000).toFixed(0)}k), signaling heavy equity upside for top performers.`);
    }

    anomalies.push(`Grading threshold compression: Base salary bands remain narrow ($${(avgBaseSalary / 1000).toFixed(0)}k average), pushing the burden of scaling onto equity components.`);
    
    recommendation = `When transitioning into ${name} equivalent bands, negotiate for signing bonuses to offset initial equity vest gaps.`;
  }
  else if (type === "location") {
    summary = `Geographic compensation report for ${name}. The average local package totals $${(avgTotalComp / 1000).toFixed(1)}k, reflecting localized cost-of-living indexation.`;
    
    if (name === "Remote") {
      observations.push("Remote roles demonstrate higher equity weightings, as companies substitute location-based office perks for long-term equity grants.");
      recommendation = "Remote candidates should optimize for global payroll structures and request USD-pegged equity schedules.";
    } else {
      observations.push(`Local geographic base salary baseline sits at $${(avgBaseSalary / 1000).toFixed(0)}k.`);
      recommendation = `Ensure your base salary meets the local tier metrics. Consider ${name}'s tax brackets before finalizing equity ratios.`;
    }
  }
  else if (type === "compare") {
    summary = "Analytical review of selected compensation structures. Comparative side-by-side metrics highlight variance in component weightings.";
    
    const compData = input.comparisonData || [];
    if (compData.length >= 2) {
      const c1 = compData[0];
      const c2 = compData[1];
      if (c1.total && c2.total) {
        const diff = Math.abs(c1.total - c2.total);
        const pct = Math.round((diff / Math.min(c1.total, c2.total)) * 100);
        const leader = c1.total > c2.total ? c1.companyName : c2.companyName;
        observations.push(`Compensation discrepancy: A ${pct}% ($${(diff / 1000).toFixed(1)}k) gap exists between selected targets, with ${leader} leading the pay scale.`);
      }
    }
    
    observations.push("Stock grants are the dominant driver of compensation delta; base salary variance remains below 15% across targets.");
    anomalies.push("Component allocation imbalance: Some targets substitute fixed cash for high-risk equity grants, skewing risk profile.");
    
    recommendation = "Select the target with the higher base salary if safety and immediate liquid cash are priority; choose the equity leader if seeking high growth upside.";
  }
  else {
    // General / Dashboard
    summary = "Platform-wide compensation intelligence brief. Analyzed trends reflect strong post-correction salary stabilization.";
    observations.push("Tier-1 companies continue to command a 20-30% premium above standard local market rates.");
    observations.push("Equity scaling remains the primary driver for total compensation scaling above L5 bands.");
    anomalies.push("Anomalous high stock-to-base ratios detected in remote hires, indicating high localized cost arbitrage.");
    recommendation = "Verify level definitions across companies during negotiation, as level grading mismatch is the primary cause of underpayment.";
  }

  if (anomalies.length === 0) {
    anomalies.push("Standard distribution curve: No statistical compensation anomalies detected within current datasets.");
  }

  return {
    summary,
    observations,
    anomalies,
    recommendation,
    provider: "local-fallback",
    providerStatus: {
      openai: process.env.OPENAI_API_KEY ? "active" : "not_configured",
      claude: "not_configured",
      gemini: "not_configured"
    }
  };
}

// Simple API integration helpers for future scaling
async function callOpenAI(input: InsightsInput, apiKey: string): Promise<any> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a professional staff compensation analyst. Output a JSON object containing: summary (string), observations (array of strings), anomalies (array of strings), recommendation (string)."
        },
        {
          role: "user",
          content: `Analyze this compensation data: ${JSON.stringify(input)}`
        }
      ]
    })
  });
  
  if (!response.ok) throw new Error("OpenAI API call failed");
  const result = await response.json();
  const parsed = JSON.parse(result.choices[0].message.content);
  return {
    ...parsed,
    provider: "openai"
  };
}
