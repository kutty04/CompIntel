export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { dataService } from "../../../services/dataService";
import { rateLimit } from "../../../lib/rateLimit";
import { handleApiError } from "../../../lib/apiErrors";
import { z } from "zod";

const salaryQuerySchema = z.object({
  company: z.string().optional(),
  location: z.string().optional(),
  role: z.string().optional(),
  level: z.string().optional(),
  sortBy: z.string().optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 15).optional()
});

const salarySubmitSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  level: z.string().min(1, "Level is required"),
  location: z.string().min(1, "Location is required"),
  baseSalary: z.number({ required_error: "Base salary is required" }).positive("Base salary must be greater than zero"),
  bonus: z.number().nonnegative("Bonus cannot be negative").optional().default(0),
  stock: z.number().nonnegative("Stock cannot be negative").optional().default(0)
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const query = salaryQuerySchema.parse(params);

    const result = await dataService.getSalaries(query);
    return NextResponse.json(result);
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch salaries");
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate Limiting: max 10 submissions per 10 minutes per IP
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (!rateLimit(ip, 10, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many salary submissions. Please try again in 10 minutes." },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to submit salaries." }, { status: 401 });
    }

    const body = await req.json();
    const payload = salarySubmitSchema.parse(body);

    const newEntry = await dataService.submitSalary({
      ...payload,
      userId: (session.user as any).id
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (err: any) {
    return handleApiError(err, "Failed to submit salary");
  }
}
