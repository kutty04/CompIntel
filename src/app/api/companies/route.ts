export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { dataService } from "../../../services/dataService";
import { handleApiError } from "../../../lib/apiErrors";

export async function GET(req: NextRequest) {
  try {
    const companies = await dataService.getCompanies();
    return NextResponse.json(companies);
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch companies");
  }
}
