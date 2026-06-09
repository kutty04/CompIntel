import { NextRequest, NextResponse } from "next/server";
import { dataService } from "../../../services/dataService";
import { calculateMedianCompensation } from "../../../lib/analytics";
import { handleApiError } from "../../../lib/apiErrors";

// Basic in-memory cache
let cachedStats: any = null;
let cacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

export async function GET(req: NextRequest) {
  try {
    const now = Date.now();
    if (cachedStats && now - cacheTime < CACHE_TTL) {
      return NextResponse.json({ ...cachedStats, cached: true });
    }

    const salariesResult = await dataService.getSalaries({ limit: 2000 });
    const entries = salariesResult.items;

    if (entries.length === 0) {
      return NextResponse.json({
        averageCompensation: 0,
        medianCompensation: 0,
        modeLevel: "N/A",
        topPayingCompany: "N/A",
        topPayingLocation: "N/A",
        topPayingRole: "N/A",
        highestStock: 0,
        highestBonus: 0,
        totalRecords: 0
      });
    }

    // 1. Average & Median
    const tcValues = entries.map(e => e.totalCompensation);
    const averageCompensation = Math.round(tcValues.reduce((a, b) => a + b, 0) / entries.length);
    const medianCompensation = Math.round(calculateMedianCompensation(tcValues));

    // 2. Mode Level
    const levelCounts: Record<string, number> = {};
    entries.forEach(e => {
      levelCounts[e.level] = (levelCounts[e.level] || 0) + 1;
    });
    let modeLevel = "N/A";
    let maxLevelCount = 0;
    Object.entries(levelCounts).forEach(([lvl, count]) => {
      if (count > maxLevelCount) {
        maxLevelCount = count;
        modeLevel = lvl;
      }
    });

    // Helper for grouping average TC
    const getTopPayingByGroup = (groupByFn: (e: any) => string) => {
      const groups: Record<string, { sum: number; count: number }> = {};
      entries.forEach(e => {
        const key = groupByFn(e);
        if (!groups[key]) groups[key] = { sum: 0, count: 0 };
        groups[key].sum += e.totalCompensation;
        groups[key].count += 1;
      });

      let topKey = "N/A";
      let topAvg = 0;
      Object.entries(groups).forEach(([key, stats]) => {
        const avg = stats.sum / stats.count;
        if (avg > topAvg) {
          topAvg = avg;
          topKey = key;
        }
      });
      return { name: topKey, avg: Math.round(topAvg) };
    };

    // 3. Top Paying Company, Location, Role
    const topCompany = getTopPayingByGroup(e => e.company.name);
    const topLocation = getTopPayingByGroup(e => e.location);
    const topRole = getTopPayingByGroup(e => e.role);

    // 4. Highest Stock & Bonus
    const highestStock = Math.max(...entries.map(e => e.stock));
    const highestBonus = Math.max(...entries.map(e => e.bonus));

    cachedStats = {
      averageCompensation,
      medianCompensation,
      modeLevel,
      topPayingCompany: topCompany.name,
      topPayingCompanyAvg: topCompany.avg,
      topPayingLocation: topLocation.name,
      topPayingLocationAvg: topLocation.avg,
      topPayingRole: topRole.name,
      topPayingRoleAvg: topRole.avg,
      highestStock: highestStock > 0 ? highestStock : 0,
      highestBonus: highestBonus > 0 ? highestBonus : 0,
      totalRecords: entries.length
    };
    cacheTime = now;

    return NextResponse.json(cachedStats);
  } catch (err: any) {
    return handleApiError(err, "Failed to calculate statistics");
  }
}
