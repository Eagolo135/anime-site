import type {
  DispatchRequest,
  DispatchResponse,
  PoemRequest,
} from "@/lib/mcp/contracts";
import { generateShir0Reply } from "@/lib/providers/llmShir0Provider";
import { generatePoem } from "@/lib/providers/llmPoemProvider";
import { fetchAnimeImage } from "@/lib/providers/jikanImageProvider";
import { resolveContext } from "@/lib/mcp/resolver";
import { getSessionSnapshot, updateSession } from "@/lib/mcp/sessionStore";
import type { ChatTurn } from "@/lib/mcp/contracts";

function pickCharacterForAnime(
  anime: string | null,
  clarificationOptions: DispatchResponse["shir0"]["clarificationOptions"]
): string | null {
  if (!anime) {
    return null;
  }

  const option = clarificationOptions.find((item) => item.anime === anime) ?? clarificationOptions[0];
  return option?.character ?? null;
}

function inferPoemTone(message: string, history: ChatTurn[]): string {
  const samples = [...history.slice(-4).map((turn) => turn.content), message].join(" ").toLowerCase();

  if (/(soft|gentle|calm|quiet|tender)/.test(samples)) {
    return "gentle";
  }

  if (/(funny|playful|light|cheerful)/.test(samples)) {
    return "playful";
  }

  if (/(dark|intense|heavy|tragic)/.test(samples)) {
    return "dramatic";
  }

  return "cinematic";
}

function persistSession(
  sessionId: string | undefined,
  history: ChatTurn[],
  options: {
    resolvedContext?: { anime: string; character: string } | null;
    pendingClarification?: DispatchResponse["shir0"]["clarificationOptions"];
  }
) {
  if (!sessionId) {
    return;
  }

  updateSession(sessionId, (current) => ({
    ...current,
    history,
    resolvedContext: options.resolvedContext ?? current.resolvedContext,
    pendingClarification: options.pendingClarification ?? current.pendingClarification,
  }));
}

export async function dispatchMcpRequest(request: DispatchRequest): Promise<DispatchResponse> {
  const session = request.sessionId ? getSessionSnapshot(request.sessionId) : null;
  const baseHistory = request.history && request.history.length > 0 ? request.history : session?.history ?? [];

  const userTurn: ChatTurn = {
    role: "user",
    content: request.message,
  };

  const historyWithUser = [...baseHistory, userTurn].slice(-20);

  const shir0 = await generateShir0Reply(request.message, baseHistory);
  const context = resolveContext(request.message, {
    pendingClarification: session?.pendingClarification ?? [],
    resolvedContext: session?.resolvedContext ?? null,
    allowCarryForward: true,
  });

  // Merge LLM-extracted context as fallback when static resolver misses
  const resolvedAnime = context.anime ?? shir0.extractedContext?.anime ?? null;
  const resolvedCharacter = context.character ?? shir0.extractedContext?.character ?? null;

  const assistantTurn: ChatTurn = {
    role: "assistant",
    content: shir0.reply,
  };

  const finalHistory = [...historyWithUser, assistantTurn].slice(-20);

  // No anime or character detected anywhere — chat only
  if (!resolvedAnime && !resolvedCharacter) {
    const response: DispatchResponse = {
      shir0,
      poem: null,
      image: null,
    };

    persistSession(request.sessionId, finalHistory, {
      pendingClarification: [],
    });

    return response;
  }

  // Anime or character detected — always generate poem + image
  const anime = resolvedAnime ?? (resolvedCharacter ? `${resolvedCharacter}'s anime` : "Unknown");
  const character = resolvedCharacter
    ?? pickCharacterForAnime(resolvedAnime, context.clarificationOptions)
    ?? "main character";

  const poemRequest: PoemRequest = {
    anime,
    character,
    length: "medium",
    tone: inferPoemTone(request.message, baseHistory),
  };

  const [poem, image] = await Promise.all([
    generatePoem(poemRequest),
    fetchAnimeImage(anime, character),
  ]);

  const response: DispatchResponse = {
    shir0,
    poem,
    image,
  };

  persistSession(request.sessionId, finalHistory, {
    resolvedContext: { anime, character },
    pendingClarification: [],
  });

  return response;
}
