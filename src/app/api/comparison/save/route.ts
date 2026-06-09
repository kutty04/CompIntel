export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { dataService } from "../../../../services/dataService";
import { handleApiError } from "../../../../lib/apiErrors";
import { z } from "zod";

const saveComparisonSchema = z.object({
  comparisonData: z.any({ required_error: "comparisonData is required" })
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to save comparisons." }, { status: 401 });
    }

    const body = await req.json();
    const payload = saveComparisonSchema.parse(body);

    const saved = await dataService.saveComparison(
      (session.user as any).id,
      payload.comparisonData
    );

    return NextResponse.json(saved, { status: 201 });
  } catch (err: any) {
    return handleApiError(err, "Failed to save comparison");
  }
}
