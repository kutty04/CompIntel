import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/services/dataService";
import { rateLimit } from "../../../../lib/rateLimit";
import { handleApiError } from "@/lib/apiErrors";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Rate Limiting: max 15 shares per 5 minutes per IP
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (!rateLimit(ip, 15, 5 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many comparison shares. Please try again in 5 minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { comparisonData, title } = body;

    if (!comparisonData || !Array.isArray(comparisonData)) {
      return NextResponse.json({ error: "Invalid comparison data" }, { status: 400 });
    }

    // Generate a unique 8-character hex slug
    const slug = crypto.randomBytes(4).toString("hex");

    const shared = await dataService.createSharedComparison(slug, comparisonData, title);

    return NextResponse.json({ slug, shared });
  } catch (err: any) {
    return handleApiError(err, "Failed to share comparison");
  }
}
