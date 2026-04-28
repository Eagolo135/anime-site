import { NextRequest, NextResponse } from "next/server";
import { fetchAnimeImage } from "@/lib/providers/jikanImageProvider";
import type { ImageRequest } from "@/lib/mcp/contracts";
import { getTrimmedString } from "@/lib/mcp/validation";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Partial<ImageRequest>;

  const anime = getTrimmedString(payload.anime);
  const character = getTrimmedString(payload.character) ?? null;

  if (!anime) {
    return NextResponse.json(
      {
        error: "anime is required",
      },
      { status: 400 }
    );
  }

  const image = await fetchAnimeImage(anime, character);
  return NextResponse.json(image, { status: 200 });
}
