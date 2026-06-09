import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { dataService } from "../../../../services/dataService";
import { handleApiError } from "../../../../lib/apiErrors";
import { z } from "zod";

const salaryUpdateSchema = z.object({
  role: z.string().min(1, "Role is required"),
  level: z.string().min(1, "Level is required"),
  location: z.string().min(1, "Location is required"),
  baseSalary: z.number().positive("Base salary must be positive"),
  bonus: z.number().nonnegative("Bonus cannot be negative").optional().default(0),
  stock: z.number().nonnegative("Stock cannot be negative").optional().default(0)
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const payload = salaryUpdateSchema.parse(body);

    const updated = await dataService.updateSalary(id, {
      ...payload,
      userId: (session.user as any).id
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return handleApiError(err, "Failed to update salary entry");
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deleted = await dataService.deleteSalary(id, (session.user as any).id);
    return NextResponse.json({ message: "Salary entry deleted successfully", deleted });
  } catch (err: any) {
    return handleApiError(err, "Failed to delete salary entry");
  }
}
