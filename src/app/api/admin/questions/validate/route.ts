import { NextResponse } from "next/server";
import { getAdminTokenFromRequest, verifyAdminImportToken } from "@/lib/adminAuth";
import { validateQuestions } from "@/lib/questionValidation";

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

  return NextResponse.json(validateQuestions(body.payload));
}
