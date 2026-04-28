export type ImageProvider = {
  lookupByAnimeTitles: (titles: string[]) => Promise<Record<string, string | null>>;
};

export const jikanRouteImageProvider: ImageProvider = {
  async lookupByAnimeTitles(titles) {
    if (titles.length === 0) {
      return {};
    }

    const params = new URLSearchParams({ titles: titles.join(",") });
    const response = await fetch(`/api/jikan-images?${params.toString()}`);

    if (!response.ok) {
      return {};
    }

    const payload = (await response.json()) as {
      results: Array<{ title: string; imageUrl: string | null }>;
    };

    const lookup: Record<string, string | null> = {};
    for (const item of payload.results) {
      lookup[item.title] = item.imageUrl;
    }

    return lookup;
  },
};

export async function lookupAnimeImages(
  titles: string[],
  provider: ImageProvider = jikanRouteImageProvider
) {
  return provider.lookupByAnimeTitles(titles);
}
