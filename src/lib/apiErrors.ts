import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Standard API error responder. Handles Zod validation exceptions and 
 * maps production database connection losses to HTTP 503 Service Unavailable.
 */
export function handleApiError(err: any, fallbackMsg: string) {
  if (err instanceof z.ZodError) {
    return NextResponse.json({ error: "Validation failed", details: err.format() }, { status: 400 });
  }

  const isDbError = err.message && err.message.includes("Service Temporarily Unavailable");
  const status = isDbError ? 503 : 500;

  return NextResponse.json(
    { error: err.message || fallbackMsg },
    { status }
  );
}
