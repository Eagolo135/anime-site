import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Anime Poetry Archive",
  description: "How to use Shir0 and the Anime Poetry Archive tools.",
};

export default function AboutPage() {
  return (
    <main className="relative mx-auto w-full max-w-4xl px-5 pb-16 pt-10 md:px-10">
      <section className="rounded-[2rem] border border-amber-50/20 bg-[linear-gradient(170deg,rgba(30,21,37,0.84),rgba(16,23,41,0.9))] p-6 shadow-[0_20px_60px_rgba(5,4,12,0.52)] backdrop-blur-md md:p-8">
        <h1 className="font-display text-4xl text-amber-100 md:text-5xl">About This Site</h1>
        <p className="mt-3 text-amber-50/85 md:text-lg">
          This archive blends anime references with short poetry. Shir0 is the assistant that helps
          you find characters, generate verses, and fetch matching artwork.
        </p>

        <h2 className="mt-8 font-display text-2xl text-amber-100">How To Use It</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-amber-50/85">
          <li>Use the Shir0 panel first. Ask for an anime or character.</li>
          <li>If Shir0 asks for clarification, click one of the suggested options.</li>
          <li>Use the search bar to browse archive entries by title, character, or phrase.</li>
          <li>Try another prompt if poem or artwork is temporarily unavailable.</li>
        </ol>

        <h2 className="mt-8 font-display text-2xl text-amber-100">MCP Tools In This App</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-amber-50/85">
          <li>
            <span className="font-semibold text-amber-100">Chat tool:</span> identifies intent and
            can return clarification options.
          </li>
          <li>
            <span className="font-semibold text-amber-100">Poem tool:</span> generates a short anime
            poem using selected context.
          </li>
          <li>
            <span className="font-semibold text-amber-100">Image tool:</span> attempts to fetch anime
            artwork for the requested title.
          </li>
          <li>
            <span className="font-semibold text-amber-100">Dispatch tool:</span> orchestrates the full
            Shir0 flow across tools.
          </li>
        </ul>
      </section>
    </main>
  );
}
