// app/api/test/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  console.log("✅ TEST API ROUTE CALLED");
  return NextResponse.json({
    message: "Test API route works",
    timestamp: new Date().toISOString(),
  });
}
