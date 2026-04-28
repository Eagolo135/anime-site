"use client";

import { FormEvent, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { ChatTurn, ClarificationOption, DispatchResponse } from "@/lib/mcp/contracts";

export type FullPageGenerationPayload = {
  anime: string;
  character: string;
  poem: string | null;
  imageUrl: string | null;
  matchedTitle: string | null;
};

type Shir0PanelProps = {
  initialPrompt?: string;
  onGeneration?: (payload: FullPageGenerationPayload) => void;
};

type DispatchState = {
  loading: boolean;
  error: string | null;
  data: DispatchResponse | null;
};

function toHistory(turns: ChatTurn[]): ChatTurn[] {
  return turns.slice(-12);
}

const SESSION_STORAGE_KEY = "shir0-session-id";

function createSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `shir0-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function Shir0Panel({
  initialPrompt = "Talk to Shir0 about anime or characters.",
  onGeneration,
}: Shir0PanelProps) {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const sessionIdRef = useRef("");
  const [renderedReply, setRenderedReply] = useState("");
  const [isRendering, setIsRendering] = useState(false);
  const [state, setState] = useState<DispatchState>({
    loading: false,
    error: null,
    data: null,
  });

  const canSend = message.trim().length > 0 && !state.loading;

  const clarificationOptions = useMemo<ClarificationOption[]>(() => {
    return state.data?.shir0.clarificationOptions ?? [];
  }, [state.data]);

  const ensureSessionId = (): string => {
    if (sessionIdRef.current) {
      return sessionIdRef.current;
    }

    if (typeof window === "undefined") {
      return "";
    }

    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) {
      sessionIdRef.current = existing;
      return existing;
    }

    const next = createSessionId();
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, next);
    sessionIdRef.current = next;
    return next;
  };

  const typeText = async (
    fullText: string,
    setter: Dispatch<SetStateAction<string>>,
    speed = 8
  ) => {
    setter("");

    for (let index = 1; index <= fullText.length; index += 1) {
      setter(fullText.slice(0, index));
      await new Promise((resolve) => setTimeout(resolve, speed));
    }
  };

  const renderConversation = async (payload: DispatchResponse) => {
    setIsRendering(true);
    await typeText(payload.shir0.reply, setRenderedReply, 8);
    setIsRendering(false);
  };

  const publishFullPageGeneration = async (payload: DispatchResponse) => {
    if (!onGeneration) {
      return;
    }

    const shouldGenerate =
      payload.shir0.intent === "generate" || Boolean(payload.poem) || Boolean(payload.image);

    if (!shouldGenerate) {
      return;
    }

    const anime = payload.image?.anime ?? payload.shir0.clarificationOptions[0]?.anime;
    if (!anime) {
      return;
    }

    const character = payload.image?.character ?? payload.shir0.clarificationOptions[0]?.character ?? "main character";
    const poemTone = payload.poem?.meta.tone ?? "cinematic";
    const poemLength = payload.poem?.meta.length ?? "medium";

    try {
      const [poemResponse, imageResponse] = await Promise.all([
        fetch("/api/mcp/poem", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            anime,
            character,
            tone: poemTone,
            length: poemLength,
          }),
        }),
        fetch("/api/mcp/image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            anime,
            character,
          }),
        }),
      ]);

      const poemPayload = poemResponse.ok
        ? ((await poemResponse.json()) as { poem?: string })
        : null;
      const imagePayload = imageResponse.ok
        ? ((await imageResponse.json()) as { imageUrl?: string | null; matchedTitle?: string | null })
        : null;

      onGeneration({
        anime,
        character,
        poem: poemPayload?.poem ?? payload.poem?.poem ?? null,
        imageUrl: imagePayload?.imageUrl ?? payload.image?.imageUrl ?? null,
        matchedTitle: imagePayload?.matchedTitle ?? payload.image?.matchedTitle ?? anime,
      });
    } catch {
      onGeneration({
        anime,
        character,
        poem: payload.poem?.poem ?? null,
        imageUrl: payload.image?.imageUrl ?? null,
        matchedTitle: payload.image?.matchedTitle ?? anime,
      });
    }
  };

  const dispatchMessage = async (content: string) => {
    const userTurn: ChatTurn = {
      role: "user",
      content,
    };

    const nextHistory = [...history, userTurn];
    setHistory(nextHistory);
    setState((previous) => ({ ...previous, loading: true, error: null }));
    setRenderedReply("");

    const activeSessionId = ensureSessionId();

    try {
      const response = await fetch("/api/mcp/dispatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          history: toHistory(nextHistory),
          sessionId: activeSessionId || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Shir0 could not respond right now.");
      }

      const payload = (await response.json()) as DispatchResponse;
      const assistantTurn: ChatTurn = {
        role: "assistant",
        content: payload.shir0.reply,
      };

      setHistory((previous) => [...previous, assistantTurn]);
      setState({
        loading: false,
        error: null,
        data: payload,
      });
      void renderConversation(payload);
      void publishFullPageGeneration(payload);
    } catch {
      setState({
        loading: false,
        error: "Shir0 is recharging. Try again in a moment.",
        data: null,
      });
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    setMessage("");
    await dispatchMessage(trimmed);
  };

  const onClarify = async (option: ClarificationOption) => {
    const prompt = `Create a poem about ${option.character} from ${option.anime}`;
    await dispatchMessage(prompt);
  };

  const onResetConversation = async () => {
    const currentSessionId = ensureSessionId();

    try {
      await fetch("/api/mcp/session", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
        }),
      });
    } catch {
      // Ignore reset transport failures; local reset still applies.
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }

    sessionIdRef.current = "";
    setMessage("");
    setHistory([]);
    setRenderedReply("");
    setIsRendering(false);
    setState({
      loading: false,
      error: null,
      data: null,
    });

    ensureSessionId();
  };

  return (
    <aside className="rounded-[2rem] border border-cyan-200/20 bg-[linear-gradient(170deg,rgba(16,30,48,0.85),rgba(21,16,39,0.93))] p-5 shadow-[0_20px_60px_rgba(2,8,20,0.5)] md:p-6">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-full border border-cyan-200/50 bg-cyan-300/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(224,251,255,0.65),rgba(96,181,219,0.2)_45%,rgba(20,39,66,0.45)_75%)]" />
          <div className="absolute bottom-2 left-1/2 h-1.5 w-7 -translate-x-1/2 rounded-full bg-cyan-50/80" />
        </div>
        <div>
          <p className="font-display text-2xl text-cyan-50">Shir0</p>
          <p className="text-sm text-cyan-100/70">AI site mascot</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onResetConversation}
        className="mt-3 inline-flex h-8 items-center rounded-xl border border-cyan-100/25 px-3 text-xs text-cyan-100/80 transition hover:border-cyan-100/50 hover:text-cyan-50"
      >
        Reset conversation
      </button>

      <p className="mt-4 text-sm leading-relaxed text-cyan-50/85">{initialPrompt}</p>

      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask Shir0 about an anime or character..."
          className="min-h-24 w-full rounded-2xl border border-cyan-100/20 bg-zinc-950/55 p-4 text-sm text-cyan-50 outline-none transition focus:border-cyan-200/55 focus:ring-2 focus:ring-cyan-200/30"
          aria-label="Shir0 conversation input"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="h-11 w-full rounded-2xl border border-cyan-100/35 bg-[linear-gradient(130deg,#8de0ff_0%,#5ebae2_52%,#8f79ff_100%)] px-5 text-sm font-semibold text-zinc-950 shadow-[0_10px_24px_rgba(3,12,22,0.45)] transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.loading ? "Shir0 is thinking..." : isRendering ? "Shir0 is typing..." : "Send to Shir0"}
        </button>
      </form>

      {state.error && <p className="mt-3 text-sm text-rose-200">{state.error}</p>}

      {history.length > 0 && (
        <div
          className="mt-4 max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-cyan-100/15 bg-zinc-950/35 p-3"
          aria-label="Shir0 conversation transcript"
        >
          {history.map((turn, index) => {
            const isLastAssistant =
              turn.role === "assistant" && index === history.length - 1 && isRendering && renderedReply.length > 0;

            return (
              <div
                key={`${turn.role}-${index}`}
                className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  turn.role === "user"
                    ? "ml-6 border border-amber-100/25 bg-amber-50/10 text-amber-50"
                    : "mr-6 border border-cyan-100/20 bg-cyan-50/5 text-cyan-50/90"
                }`}
              >
                <p className="mb-1 text-[10px] uppercase tracking-[0.12em] opacity-70">
                  {turn.role === "user" ? "You" : "Shir0"}
                </p>
                <p className="whitespace-pre-line">
                  {isLastAssistant ? renderedReply : turn.content}
                  {isLastAssistant && (
                    <span className="ml-1 inline-block h-3 w-[1px] animate-pulse bg-cyan-100/80" />
                  )}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {state.data && (
        <div className="mt-5 space-y-4">
          {clarificationOptions.length > 0 && (
            <div className="rounded-2xl border border-cyan-100/20 bg-zinc-900/50 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-cyan-100/65">Choose one</p>
              <div className="mt-2 grid gap-2">
                {clarificationOptions.map((option) => (
                  <button
                    key={`${option.anime}-${option.character}`}
                    type="button"
                    onClick={() => onClarify(option)}
                    className="rounded-xl border border-cyan-100/20 bg-cyan-100/5 px-3 py-2 text-left text-xs text-cyan-50/90 transition hover:border-cyan-100/45"
                  >
                    {option.character} - {option.anime}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
