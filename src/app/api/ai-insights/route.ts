export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { generateAIInsights, InsightsInput } from "@/lib/aiInsights";
import { dataService } from "@/services/dataService";
import { rateLimit } from "../../../lib/rateLimit";
import { handleApiError } from "@/lib/apiErrors";

export async function POST(req: NextRequest) {
  try {
    // Rate Limiting: max 30 requests per 10 minutes per IP
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (!rateLimit(ip, 30, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many AI request attempts. Please try again in 10 minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const input = body as InsightsInput;

    if (!input || !input.name || !input.type) {
      return NextResponse.json({ error: "Invalid insights input parameters" }, { status: 400 });
    }

    // Retrieve baseline stats for context if not provided
    if (input.type === "company" && !input.baselineMedian) {
      const statsRes = await dataService.getSalaries({ limit: 1000 });
      const salaries = statsRes.entries.map(e => e.totalCompensation);
      if (salaries.length > 0) {
        const sorted = [...salaries].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        input.baselineMedian = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      }
    }

    const insights = await generateAIInsights(input);
    return NextResponse.json(insights);
  } catch (err: any) {
    return handleApiError(err, "Failed to generate AI insights");
  }
}
