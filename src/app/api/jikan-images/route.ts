import { NextRequest, NextResponse } from "next/server";

type JikanAnime = {
  images?: {
    jpg?: {
      image_url?: string;
      large_image_url?: string;
    };
    webp?: {
      image_url?: string;
      large_image_url?: string;
    };
  };
  title?: string;
  title_english?: string;
};

type JikanResponse = {
  data?: JikanAnime[];
};

type ImageLookup = {
  title: string;
  imageUrl: string | null;
  matchedTitle: string | null;
};

const TITLE_LIMIT = 8;

function parseTitles(rawTitles: string): string[] {
  return rawTitles
    .split(",")
    .map((title) => title.trim())
    .filter(Boolean)
    .slice(0, TITLE_LIMIT);
}

function pickBestImage(anime?: JikanAnime): string | null {
  if (!anime) {
    return null;
  }

  return (
    anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.large_image_url ||
    anime.images?.webp?.image_url ||
    anime.images?.jpg?.image_url ||
    null
  );
}

async function lookupTitle(title: string): Promise<ImageLookup> {
  const endpoint = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      next: { revalidate: 60 * 60 * 12 },
    });

    if (!response.ok) {
      return { title, imageUrl: null, matchedTitle: null };
    }

    const payload = (await response.json()) as JikanResponse;
    const topResult = payload.data?.[0];
    const imageUrl = pickBestImage(topResult);

    return {
      title,
      imageUrl,
      matchedTitle: topResult?.title_english || topResult?.title || null,
    };
  } catch {
    return { title, imageUrl: null, matchedTitle: null };
  }
}

export async function GET(request: NextRequest) {
  const rawTitles = request.nextUrl.searchParams.get("titles") ?? "";

  if (!rawTitles.trim()) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  const titles = parseTitles(rawTitles);
  const results: ImageLookup[] = [];

  for (const title of titles) {
    // Keep requests sequential to avoid tripping free-tier API limits.
    const record = await lookupTitle(title);
    results.push(record);
  }

  return NextResponse.json({ results }, { status: 200 });
}
