export interface DataQualityReport {
  healthScore: number; // 0 to 100
  totalChecked: number;
  duplicateCount: number;
  outlierCount: number;
  invalidCompCount: number;
  normalizationFlags: number;
  healthAssessment: "EXCELLENT" | "STABLE" | "WARNING" | "CRITICAL";
  details: {
    duplicates: string[];
    outliers: string[];
    invalids: string[];
  };
}

export function runDataQualityScan(entries: any[]): DataQualityReport {
  let duplicateCount = 0;
  let outlierCount = 0;
  let invalidCompCount = 0;
  let normalizationFlags = 0;

  const duplicates: string[] = [];
  const outliers: string[] = [];
  const invalids: string[] = [];

  const seen = new Set<string>();
  const totalChecked = entries.length;

  // 1. Group by role/level to calculate segment standard deviations
  const segmentCompValues: Record<string, number[]> = {};
  entries.forEach(e => {
    const key = `${e.role}-${e.level}`.toLowerCase();
    if (!segmentCompValues[key]) segmentCompValues[key] = [];
    segmentCompValues[key].push(e.totalCompensation);
  });

  // Calculate segment means and standard deviations
  const segmentStats: Record<string, { mean: number; stdDev: number }> = {};
  Object.entries(segmentCompValues).forEach(([key, values]) => {
    const count = values.length;
    const mean = values.reduce((sum, v) => sum + v, 0) / count;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance) || 1; // avoid zero dev
    segmentStats[key] = { mean, stdDev };
  });

  // 2. Scan each entry
  entries.forEach((e, idx) => {
    // Check duplicates based on composite hash
    const compHash = `${e.company?.name || e.companyName}-${e.role}-${e.level}-${e.location}-${e.baseSalary}-${e.bonus}-${e.stock}`.toLowerCase();
    if (seen.has(compHash)) {
      duplicateCount++;
      if (duplicates.length < 5) {
        duplicates.push(`Entry #${idx + 1}: Duplicate package found for ${e.company?.name || e.companyName} ${e.level} in ${e.location}.`);
      }
    } else {
      seen.add(compHash);
    }

    // Check invalid compensation ranges
    if (e.baseSalary <= 0 || e.totalCompensation <= 0) {
      invalidCompCount++;
      if (invalids.length < 5) {
        invalids.push(`Entry #${idx + 1}: Base salary ($${e.baseSalary}) or TC ($${e.totalCompensation}) cannot be zero or negative.`);
      }
    } else if (e.baseSalary > 2000000) {
      invalidCompCount++;
      if (invalids.length < 5) {
        invalids.push(`Entry #${idx + 1}: Suspicious base salary of $${(e.baseSalary / 1000).toFixed(0)}k exceeds $2.0M safety limit.`);
      }
    }

    // Check statistical outliers (> 4 standard deviations from segment mean)
    const key = `${e.role}-${e.level}`.toLowerCase();
    const stats = segmentStats[key];
    if (stats && stats.stdDev > 0) {
      const zScore = Math.abs(e.totalCompensation - stats.mean) / stats.stdDev;
      if (zScore > 4) {
        outlierCount++;
        if (outliers.length < 5) {
          outliers.push(`Entry #${idx + 1}: Outlier total comp ($${(e.totalCompensation / 1000).toFixed(0)}k) exceeds segment mean by ${(zScore).toFixed(1)} std devs.`);
        }
      }
    }

    // Check normalization guidelines
    if (e.level !== e.level.toUpperCase().trim()) {
      normalizationFlags++;
    }
  });

  // 3. Compute Data Health Score (deduct score based on anomalies)
  let healthScore = 100;
  if (totalChecked > 0) {
    const errorRatio = (duplicateCount + outlierCount * 2 + invalidCompCount * 3) / totalChecked;
    healthScore = Math.max(0, Math.round(100 - errorRatio * 100));
  }

  let healthAssessment: DataQualityReport["healthAssessment"] = "EXCELLENT";
  if (healthScore < 60) healthAssessment = "CRITICAL";
  else if (healthScore < 80) healthAssessment = "WARNING";
  else if (healthScore < 95) healthAssessment = "STABLE";

  return {
    healthScore,
    totalChecked,
    duplicateCount,
    outlierCount,
    invalidCompCount,
    normalizationFlags,
    healthAssessment,
    details: {
      duplicates,
      outliers,
      invalids
    }
  };
}