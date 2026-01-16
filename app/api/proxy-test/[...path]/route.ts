// app/api/proxy-test/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const path = (await params).path;
  console.log("✅ PROXY TEST ROUTE CALLED with path:", path);

  return NextResponse.json({
    message: "Proxy test route works",
    path: path.join("/"),
    timestamp: new Date().toISOString(),
    url: request.url,
    fullPath: `/api/proxy-test/${path.join("/")}`,
  });
}
