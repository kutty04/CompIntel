export interface PercentileStats {
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface MarketPositionResult {
  percentile: number;
  median: number;
  average: number;
  difference: number;
  assessment: string;
  comparisonText: string;
}

export function calculateMedianCompensation(salaries: number[]): number {
  if (!salaries || salaries.length === 0) return 0;
  const sorted = [...salaries].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function calculatePercentiles(salaries: number[]): PercentileStats {
  if (!salaries || salaries.length === 0) {
    return { p25: 0, p50: 0, p75: 0, p90: 0 };
  }
  const sorted = [...salaries].sort((a, b) => a - b);
  
  const getPercentile = (p: number) => {
    const idx = (sorted.length - 1) * (p / 100);
    const low = Math.floor(idx);
    const high = Math.ceil(idx);
    if (low === high) return sorted[low];
    return sorted[low] + (sorted[high] - sorted[low]) * (idx - low);
  };

  return {
    p25: Math.round(getPercentile(25)),
    p50: Math.round(getPercentile(50)),
    p75: Math.round(getPercentile(75)),
    p90: Math.round(getPercentile(90))
  };
}

export function calculateMarketPosition(userComp: number, salaries: number[]): MarketPositionResult {
  if (!salaries || salaries.length === 0) {
    return {
      percentile: 0,
      median: 0,
      average: 0,
      difference: 0,
      assessment: "No Data Available",
      comparisonText: "Not enough data available for accurate estimation."
    };
  }

  const sorted = [...salaries].sort((a, b) => a - b);
  const median = calculateMedianCompensation(sorted);
  const average = sorted.reduce((sum, val) => sum + val, 0) / sorted.length;
  
  // Percentile calculation
  let countBelow = 0;
  for (const s of sorted) {
    if (s < userComp) countBelow++;
  }
  const percentile = Math.round((countBelow / sorted.length) * 100);
  
  // Calculate percentage difference
  const difference = median > 0 ? ((userComp - median) / median) * 100 : 0;

  // Assessment logic
  let assessment = "At Market Average";
  if (difference < -10) {
    assessment = "Below Market Average";
  } else if (difference > 10) {
    assessment = "Above Market Average";
  }

  const percentileText = percentile >= 50
    ? `You earn more than ${percentile}% of professionals in comparable roles.`
    : `You earn less than ${100 - percentile}% of professionals in comparable roles.`;

  return {
    percentile,
    median: Math.round(median),
    average: Math.round(average),
    difference: Math.round(difference * 10) / 10,
    assessment,
    comparisonText: percentileText
  };
}

export function calculateCompanyPremium(companySalaries: number[], baselineMedian: number): number {
  if (!companySalaries || companySalaries.length === 0 || baselineMedian === 0) return 0;
  const companyMedian = calculateMedianCompensation(companySalaries);
  const diff = ((companyMedian - baselineMedian) / baselineMedian) * 100;
  return Math.round(diff * 10) / 10;
}

export function calculateLocationPremium(locationSalaries: number[], baselineMedian: number): number {
  if (!locationSalaries || locationSalaries.length === 0 || baselineMedian === 0) return 0;
  const locationMedian = calculateMedianCompensation(locationSalaries);
  const diff = ((locationMedian - baselineMedian) / baselineMedian) * 100;
  return Math.round(diff * 10) / 10;
}

export function calculateLevelPremium(levelSalaries: number[], baselineMedian: number): number {
  if (!levelSalaries || levelSalaries.length === 0 || baselineMedian === 0) return 0;
  const levelMedian = calculateMedianCompensation(levelSalaries);
  const diff = ((levelMedian - baselineMedian) / baselineMedian) * 100;
  return Math.round(diff * 10) / 10;
}