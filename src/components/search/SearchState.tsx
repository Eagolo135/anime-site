"use client";

import { useEffect, useState } from "react";
import { ArchiveResults } from "@/components/archive/ArchiveResults";
import { Shir0Panel, type FullPageGenerationPayload } from "@/components/shir0/Shir0Panel";
import { GenerationStage } from "@/components/generation/GenerationStage";
import { loadArchiveEntries } from "@/lib/providers/archiveProvider";
import { lookupAnimeImages } from "@/lib/providers/imageProvider";
import type { ArchiveEntry } from "@/data/mock/archive";

type ImageMap = Record<string, string | null>;

export function SearchState() {
  const [archiveEntries, setArchiveEntries] = useState<ArchiveEntry[]>([]);
  const [imageMap, setImageMap] = useState<ImageMap>({});
  const [generation, setGeneration] = useState<FullPageGenerationPayload | null>(null);

  useEffect(() => {
    let cancelled = false;

    const hydrateArchive = async () => {
      const entries = await loadArchiveEntries();
      if (!cancelled) {
        setArchiveEntries(entries);
      }
    };

    hydrateArchive();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const titlesToFetch = Array.from(
      new Set(archiveEntries.map((entry) => entry.animeTitle).filter((title) => imageMap[title] === undefined))
    );

    if (titlesToFetch.length === 0) {
      return;
    }

    const controller = new AbortController();

    const fetchImages = async () => {
      try {
        const lookup = await lookupAnimeImages(titlesToFetch);

        if (controller.signal.aborted) {
          return;
        }

        setImageMap((previous) => {
          return { ...previous, ...lookup };
        });
      } catch {
        // Ignore cancellation and transient network failures.
      }
    };

    fetchImages();

    return () => {
      controller.abort();
    };
  }, [archiveEntries, imageMap]);

  useEffect(() => {
    if (!generation) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const stage = document.querySelector<HTMLElement>(
        '[aria-label="Generated anime poem stage"]'
      );

      if (stage) {
        stage.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [generation]);

  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-14 pt-10 md:px-10">
      <div className="mt-0 grid items-start gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <Shir0Panel
          initialPrompt="Tell me an anime or character and I will craft a short poem with artwork."
          onGeneration={(payload) => setGeneration(payload)}
        />
        <ArchiveResults entries={archiveEntries} imageMap={imageMap} />
      </div>

      {generation && (
        <div className="mt-8 w-full">
          <GenerationStage generation={generation} onClose={() => setGeneration(null)} />
        </div>
      )}
    </section>
  );
}
