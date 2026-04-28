"use client";

import Image from "next/image";
import type { FullPageGenerationPayload } from "@/components/shir0/Shir0Panel";

type GenerationStageProps = {
  generation: FullPageGenerationPayload;
  onClose: () => void;
};

export function GenerationStage({ generation, onClose }: GenerationStageProps) {
  return (
    <section
      className="relative min-h-[88vh] w-full overflow-hidden rounded-[2.2rem] border border-cyan-100/25 bg-zinc-950 shadow-[0_30px_80px_rgba(2,8,22,0.65)]"
      aria-label="Generated anime poem stage"
    >
      {generation.imageUrl ? (
        <Image
          src={generation.imageUrl}
          alt={`${generation.anime} artwork`}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(142,223,255,0.28),rgba(31,45,86,0.14)_38%,rgba(12,14,26,0.96)_100%)]" />
      )}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,16,0.25)_0%,rgba(5,13,25,0.58)_42%,rgba(5,11,21,0.94)_100%)]" />

      <div className="relative z-10 flex min-h-[88vh] flex-col justify-between p-6 md:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/75">Shir0 Generation Stage</p>
            <h2 className="mt-2 font-display text-3xl text-cyan-50 md:text-5xl">
              {generation.matchedTitle ?? generation.anime}
            </h2>
            <p className="mt-2 text-sm text-cyan-100/75 md:text-base">Character focus: {generation.character}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-cyan-100/35 bg-zinc-900/45 px-3 py-2 text-xs text-cyan-50 transition hover:border-cyan-100/60"
          >
            Hide stage
          </button>
        </div>

        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-cyan-100/25 bg-zinc-950/55 p-6 backdrop-blur-sm md:p-10">
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">Poem</p>
          <p className="mt-4 whitespace-pre-line font-body text-lg leading-9 text-cyan-50 md:text-2xl md:leading-[2.35rem]">
            {generation.poem ?? "Shir0 could not generate a poem this pass. Keep chatting and try again."}
          </p>
        </div>
      </div>
    </section>
  );
}
