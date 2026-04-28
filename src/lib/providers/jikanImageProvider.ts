import type { ImageResponse } from "@/lib/mcp/contracts";

type JikanAnime = {
  title?: string;
  title_english?: string;
  images?: {
    jpg?: { image_url?: string; large_image_url?: string };
    webp?: { image_url?: string; large_image_url?: string };
  };
};

type JikanResponse = {
  data?: JikanAnime[];
};

function pickImage(anime?: JikanAnime): string | null {
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

export async function fetchAnimeImage(
  anime: string,
  character: string | null = null
): Promise<ImageResponse> {
  const endpoint = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(anime)}&limit=1`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      next: { revalidate: 60 * 60 * 12 },
    });

    if (!response.ok) {
      return {
        anime,
        character,
        imageUrl: null,
        matchedTitle: null,
        provider: "jikan",
      };
    }

    const payload = (await response.json()) as JikanResponse;
    const top = payload.data?.[0];

    return {
      anime,
      character,
      imageUrl: pickImage(top),
      matchedTitle: top?.title_english || top?.title || null,
      provider: "jikan",
    };
  } catch {
    return {
      anime,
      character,
      imageUrl: null,
      matchedTitle: null,
      provider: "jikan",
    };
  }
}
