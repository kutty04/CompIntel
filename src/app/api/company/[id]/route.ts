export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { dataService } from "../../../../services/dataService";
import { handleApiError } from "../../../../lib/apiErrors";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const company = await dataService.getCompany(id);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    return NextResponse.json(company);
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch company details");
  }
}
