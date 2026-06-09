import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/services/dataService";
import { handleApiError } from "@/lib/apiErrors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const shared = await dataService.getSharedComparisonBySlug(slug);
    if (!shared) {
      return NextResponse.json({ error: "Comparison not found" }, { status: 404 });
    }
    return NextResponse.json(shared);
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch shared comparison");
  }
}
