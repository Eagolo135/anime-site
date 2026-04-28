import { NextRequest, NextResponse } from "next/server";
import { generateShir0Reply } from "@/lib/providers/llmShir0Provider";
import type { Shir0ChatRequest } from "@/lib/mcp/contracts";
import { getHistory, getTrimmedString } from "@/lib/mcp/validation";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Partial<Shir0ChatRequest>;

  const message = getTrimmedString(payload.message);
  const history = getHistory(payload.history);

  if (!message) {
    return NextResponse.json(
      {
        error: "message is required",
      },
      { status: 400 }
    );
  }

  const response = await generateShir0Reply(message, history);
  return NextResponse.json(response, { status: 200 });
}
