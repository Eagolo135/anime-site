"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { ArchiveEntry } from "@/data/mock/archive";
import { resultCardVariants } from "@/motion/sceneVariants";

type ArchiveResultsProps = {
  entries: ArchiveEntry[];
  imageMap: Record<string, string | null>;
};

type ViewMode = "mosaic" | "stacks";

export function ArchiveResults({ entries, imageMap }: ArchiveResultsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("mosaic");

  const gridClassName = useMemo(() => {
    if (viewMode === "stacks") {
      return "mt-6 grid gap-4";
    }

    return "mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3";
  }, [viewMode]);

  return (
    <div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-[0.14em] text-amber-100/75">Archive View</span>
        <button
          type="button"
          onClick={() => setViewMode("mosaic")}
          aria-pressed={viewMode === "mosaic"}
          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.12em] transition ${
            viewMode === "mosaic"
              ? "border-amber-200/80 bg-amber-200/20 text-amber-50"
              : "border-amber-200/30 text-amber-100/70 hover:border-amber-200/55"
          }`}
        >
          Mosaic
        </button>
        <button
          type="button"
          onClick={() => setViewMode("stacks")}
          aria-pressed={viewMode === "stacks"}
          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.12em] transition ${
            viewMode === "stacks"
              ? "border-cyan-200/80 bg-cyan-200/20 text-cyan-50"
              : "border-cyan-200/30 text-cyan-100/70 hover:border-cyan-200/55"
          }`}
        >
          Stacks
        </button>
      </div>

      <div className={`${gridClassName} gap-3 md:gap-4`}>
        {entries.map((entry, index) => {
          const isMosaicFeature = viewMode === "mosaic" && index === 0;
          const isStacks = viewMode === "stacks";

          return (
            <motion.article
              key={entry.id}
              className={`group rounded-3xl border border-white/14 bg-[linear-gradient(180deg,rgba(251,184,106,0.14),rgba(23,24,40,0.84)_45%,rgba(14,16,30,0.92)_100%)] p-4 shadow-[0_12px_30px_rgba(2,2,8,0.42)] transition md:p-5 ${
                isStacks ? "sm:grid sm:grid-cols-[11rem,1fr] sm:items-start sm:gap-4" : ""
              } ${
                isMosaicFeature ? "md:col-span-2" : ""
              }`}
              custom={index}
              variants={resultCardVariants}
              initial="initial"
              animate="animate"
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.28 }}
            >
              <div
                className={`relative mb-3 overflow-hidden rounded-2xl border border-white/12 bg-zinc-900/70 ${
                  isStacks
                    ? "h-32 sm:mb-0 sm:h-full sm:min-h-[9.5rem]"
                    : "h-36 sm:h-44 md:mb-4 md:h-48"
                }`}
              >
                {imageMap[entry.animeTitle] ? (
                  <Image
                    src={imageMap[entry.animeTitle] as string}
                    alt={`${entry.animeTitle} artwork`}
                    fill
                    className="object-cover transition duration-400 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                ) : (
                  <div className="h-full w-full bg-[linear-gradient(140deg,rgba(245,160,78,0.38),rgba(93,131,203,0.28),rgba(29,31,56,0.75))]" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_25%,rgba(7,8,16,0.62)_100%)]" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-amber-200/85">{entry.animeTitle}</p>
                <h2 className="mt-2 font-display text-[1.35rem] text-amber-50 sm:text-2xl">{entry.phrase}</h2>
                <p className="mt-2 text-sm text-amber-100/75">Character: {entry.character}</p>
                <p
                  className={`mt-3 text-[0.97rem] leading-7 text-zinc-100/95 ${
                    isStacks ? "line-clamp-4 sm:line-clamp-none" : "line-clamp-3 md:line-clamp-none"
                  }`}
                >
                  {entry.poem}
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.13em] text-cyan-200/70">Era: {entry.era}</p>
              </div>
            </motion.article>
          );
        })}

        {entries.length === 0 && (
          <div className="col-span-full rounded-3xl border border-amber-100/20 bg-zinc-900/55 p-8 text-center text-amber-50/80">
            No poem echoes found for that query. Try anime title, character, or a phrase.
          </div>
        )}
      </div>
    </div>
  );
}
