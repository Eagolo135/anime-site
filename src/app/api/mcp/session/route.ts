import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/mcp/sessionStore";
import { getSessionId } from "@/lib/mcp/validation";

export async function DELETE(request: NextRequest) {
  const payload = (await request.json()) as {
    sessionId?: unknown;
  };

  const sessionId = getSessionId(payload.sessionId);
  if (!sessionId) {
    return NextResponse.json(
      {
        error: "sessionId is required",
      },
      { status: 400 }
    );
  }

  clearSession(sessionId);

  return NextResponse.json(
    {
      ok: true,
    },
    { status: 200 }
  );
}
