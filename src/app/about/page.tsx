import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Anime Poetry Archive",
  description: "In-depth guide to Shir0, poem generation, image lookup, and archive flow.",
};

export default function AboutPage() {
  return (
    <main className="relative mx-auto w-full max-w-4xl px-5 pb-16 pt-10 md:px-10">
      <section className="rounded-[2rem] border border-amber-50/20 bg-[linear-gradient(170deg,rgba(30,21,37,0.84),rgba(16,23,41,0.9))] p-6 shadow-[0_20px_60px_rgba(5,4,12,0.52)] backdrop-blur-md md:p-8">
        <h1 className="font-display text-4xl text-amber-100 md:text-5xl">About This Site</h1>
        <p className="mt-3 text-amber-50/85 md:text-lg">
          The Anime Poetry Archive is designed as an interactive web-art experience where anime context,
          short poetic writing, and visual atmosphere merge into one flow. Shir0 is the conversational
          mascot that helps you move from mention to interpretation, then to poem and artwork.
        </p>

        <h2 className="mt-8 font-display text-2xl text-amber-100">Source Of Truth</h2>
        <p className="mt-3 text-amber-50/85">
          This page follows the product and contract specs in docs/spec. The active baseline is:
          expressive visual identity, mock archive as canonical poetry source, and MCP-style orchestration
          for Shir0 chat, poem generation, and image fetching.
        </p>

        <h2 className="mt-8 font-display text-2xl text-amber-100">How To Use The Site</h2>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-amber-50/85">
          <li>
            Start in the Shir0 panel and mention an anime title, character name, or both (example:
            Hunter x Hunter, Gon, Kirito, Rimuru).
          </li>
          <li>
            Shir0 determines intent:
            chat for conversation,
            clarify if multiple matches are possible,
            generate when enough context is available.
          </li>
          <li>
            When context is clear, the app runs poem and image tools together, then opens a full generation stage
            with the generated poem and matched anime artwork.
          </li>
          <li>
            Use archive search at the top to browse canonical mock entries by anime title, character, or phrase.
          </li>
          <li>
            Use Reset conversation in Shir0 when you want to clear session context and start a new line of prompts.
          </li>
        </ol>

        <h2 className="mt-8 font-display text-2xl text-amber-100">What Happens Behind The Scenes</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-amber-50/85">
          <li>
            Context resolver extracts anime and character clues from your message, clarification state, and recent
            session history.
          </li>
          <li>
            Dispatcher coordinates responses so chat remains natural while poem and image results stay structurally
            consistent.
          </li>
          <li>
            Poem tool returns a valid poem payload even if LLM output is unavailable, using fallback behavior.
          </li>
          <li>
            Image tool queries Jikan and returns the best available match, or null image when no result is found.
          </li>
        </ul>

        <h2 className="mt-8 font-display text-2xl text-amber-100">Reliability And Limits</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-amber-50/85">
          <li>Poetry archive cards are mock-driven by design in this phase.</li>
          <li>Image availability depends on external Jikan coverage for a query.</li>
          <li>
            If an anime is recognized but no explicit character is provided, generation still proceeds using a fallback
            character focus.
          </li>
          <li>
            If a prompt is unsafe, Shir0 will return a safe blocked response and skip generation.
          </li>
        </ul>

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
