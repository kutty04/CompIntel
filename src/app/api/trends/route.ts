import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/services/dataService";
import { generateTrendData } from "@/lib/trends";
import { handleApiError } from "@/lib/apiErrors";
import { z } from "zod";

const trendQuerySchema = z.object({
  filterType: z.enum(["company", "level", "location", "role", "all"]).default("all"),
  filterValue: z.string().optional().default(""),
  monthsCount: z.string().transform(val => parseInt(val) || 12).optional().default("12")
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const query = trendQuerySchema.parse(params);

    // Fetch all entries for trends computation (no limit/pagination)
    const result = await dataService.getSalaries({ limit: 1000 });
    
    const trendResult = generateTrendData(
      result.entries,
      query.filterType,
      query.filterValue,
      query.monthsCount
    );

    return NextResponse.json(trendResult);
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch trends data");
  }
}
