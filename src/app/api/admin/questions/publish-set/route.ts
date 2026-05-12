import { NextResponse } from "next/server";
import { getAdminTokenFromRequest, verifyAdminImportToken } from "@/lib/adminAuth";
import { publishQuestionSet } from "@/lib/adminQuestionImport";

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!verifyAdminImportToken(getAdminTokenFromRequest(request, body))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await publishQuestionSet(
      typeof body.setId === "string" ? body.setId : "",
    );
    return NextResponse.json(result, { status: result.ok ? 200 : 422 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Publish failed." },
      { status: 500 },
    );
  }
}
