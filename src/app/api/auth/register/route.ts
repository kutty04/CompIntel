import { NextRequest, NextResponse } from "next/server";
import { dataService } from "../../../../services/dataService";
import { rateLimit } from "../../../../lib/rateLimit";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { handleApiError } from "../../../../lib/apiErrors";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export async function POST(req: NextRequest) {
  try {
    // Rate Limiting: max 5 registrations per 15 minutes per IP
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (!rateLimit(ip, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const payload = registerSchema.parse(body);

    const existingUser = await dataService.getUserByEmail(payload.email);
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const newUser = await dataService.createUser({
      name: payload.name,
      email: payload.email,
      password: hashedPassword
    });

    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt
    }, { status: 201 });
  } catch (err: any) {
    return handleApiError(err, "Registration failed");
  }
}
