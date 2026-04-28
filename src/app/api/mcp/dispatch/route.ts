import { NextRequest, NextResponse } from "next/server";
import { dispatchMcpRequest } from "@/lib/mcp/dispatcher";
import type { DispatchRequest } from "@/lib/mcp/contracts";
import { getHistory, getSessionId, getTrimmedString } from "@/lib/mcp/validation";
import { blockedSafetyReply, evaluateMessageSafety } from "@/lib/mcp/safety";

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const payload = (await request.json()) as Partial<DispatchRequest>;

  const message = getTrimmedString(payload.message);
  const history = getHistory(payload.history);
  const sessionId = getSessionId(payload.sessionId);

  if (!message) {
    return NextResponse.json(
      {
        error: "message is required",
      },
      { status: 400 }
    );
  }

  const safety = evaluateMessageSafety(message);
  if (!safety.allowed) {
    console.warn("[mcp.dispatch.blocked]", {
      requestId,
      sessionId: sessionId ?? "transient",
      reason: safety.reason,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json(
      {
        shir0: {
          reply: blockedSafetyReply(safety.reason ?? "unsafe_content"),
          intent: "chat",
          clarificationOptions: [],
        },
        poem: null,
        image: null,
      },
      { status: 200 }
    );
  }

  const response = await dispatchMcpRequest({
    message,
    history,
    sessionId: sessionId ?? undefined,
  });

  console.info("[mcp.dispatch.completed]", {
    requestId,
    sessionId: sessionId ?? "transient",
    intent: response.shir0.intent,
    hasPoem: response.poem !== null,
    hasImage: response.image !== null,
    durationMs: Date.now() - startedAt,
  });

  return NextResponse.json(response, { status: 200 });
}
