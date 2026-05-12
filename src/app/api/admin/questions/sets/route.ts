import { NextResponse } from "next/server";
import { getAdminTokenFromRequest, verifyAdminImportToken } from "@/lib/adminAuth";
import { listInternalQuestionSets } from "@/lib/adminQuestionImport";

export async function GET(request: Request) {
  if (!verifyAdminImportToken(getAdminTokenFromRequest(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const sets = await listInternalQuestionSets();
    return NextResponse.json({ sets });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load sets." },
      { status: 500 },
    );
  }
}
