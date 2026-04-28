"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { filterArchive } from "@/lib/search/filterArchive";
import { ArchiveResults } from "@/components/archive/ArchiveResults";
import { Shir0Panel, type FullPageGenerationPayload } from "@/components/shir0/Shir0Panel";
import { GenerationStage } from "@/components/generation/GenerationStage";
import { loadArchiveEntries } from "@/lib/providers/archiveProvider";
import { lookupAnimeImages } from "@/lib/providers/imageProvider";
import type { ArchiveEntry } from "@/data/mock/archive";

type ImageMap = Record<string, string | null>;

export function SearchState() {
  const [archiveEntries, setArchiveEntries] = useState<ArchiveEntry[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [imageMap, setImageMap] = useState<ImageMap>({});
  const [generation, setGeneration] = useState<FullPageGenerationPayload | null>(null);

  const results = useMemo(() => {
    return filterArchive(archiveEntries, submittedQuery);
  }, [archiveEntries, submittedQuery]);

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedQuery(inputValue);
  };

  useEffect(() => {
    const titlesToFetch = Array.from(
      new Set(results.map((entry) => entry.animeTitle).filter((title) => imageMap[title] === undefined))
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
  }, [results, imageMap]);

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
      <div className="rounded-[2rem] border border-amber-50/20 bg-[linear-gradient(170deg,rgba(30,21,37,0.84),rgba(16,23,41,0.9))] p-6 shadow-[0_20px_60px_rgba(5,4,12,0.52)] backdrop-blur-md md:p-8">
        <h1 className="font-display text-4xl text-amber-100 md:text-5xl">Poetry Archive</h1>
        <p className="mt-3 max-w-2xl text-amber-50/80 md:text-lg">
          Search by anime title, character, or phrase and enter a curated fragment of cinematic verse.
        </p>

        <form className="mt-8 flex flex-col gap-3 md:flex-row" onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Try: Spike, threads between worlds, Evangelion"
            className="h-14 flex-1 rounded-2xl border border-amber-200/20 bg-zinc-950/55 px-5 text-base text-amber-50 outline-none transition focus:border-amber-300/60 focus:ring-2 focus:ring-amber-200/30"
            aria-label="Search archive"
          />
          <button
            type="submit"
            className="h-14 rounded-2xl border border-amber-50/30 bg-[linear-gradient(130deg,#f6be6a_0%,#f0904f_50%,#d95d37_100%)] px-7 text-base font-semibold text-zinc-950 shadow-[0_12px_28px_rgba(20,7,5,0.4)] transition hover:brightness-105"
          >
            Search
          </button>
        </form>

        <p className="mt-4 text-sm text-amber-100/70" aria-live="polite">
          {submittedQuery
            ? `Showing results for "${submittedQuery}"`
            : "Submit a phrase to reveal the archive."}
        </p>
      </div>

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <Shir0Panel
          initialPrompt="Tell me an anime or character and I will craft a short poem with artwork."
          onGeneration={(payload) => setGeneration(payload)}
        />
        <ArchiveResults entries={results} imageMap={imageMap} />
      </div>

      {generation && (
        <div className="mt-8 w-full">
          <GenerationStage generation={generation} onClose={() => setGeneration(null)} />
        </div>
      )}
    </section>
  );
}
