import { NextRequest, NextResponse } from "next/server";
import { generatePoem } from "@/lib/providers/llmPoemProvider";
import type { PoemRequest } from "@/lib/mcp/contracts";
import { getTrimmedString } from "@/lib/mcp/validation";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Partial<PoemRequest>;

  const anime = getTrimmedString(payload.anime);
  const character = getTrimmedString(payload.character);

  if (!anime || !character) {
    return NextResponse.json(
      {
        error: "anime and character are required",
      },
      { status: 400 }
    );
  }

  const poem = await generatePoem({
    anime,
    character,
    tone: getTrimmedString(payload.tone) ?? "dramatic",
    length: payload.length ?? "medium",
  });

  return NextResponse.json(poem, { status: 200 });
}
