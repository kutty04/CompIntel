import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { dataService } from "../../../../services/dataService";
import { handleApiError } from "../../../../lib/apiErrors";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saved = await dataService.getSavedComparisons((session.user as any).id);
    return NextResponse.json(saved);
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch saved comparisons");
  }
}
