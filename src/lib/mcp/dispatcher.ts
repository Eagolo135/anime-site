import type {
  DispatchRequest,
  DispatchResponse,
  PoemRequest,
  Shir0ChatResponse,
} from "@/lib/mcp/contracts";
import { generateShir0Reply } from "@/lib/providers/llmShir0Provider";
import { generatePoem } from "@/lib/providers/llmPoemProvider";
import { fetchAnimeImage } from "@/lib/providers/jikanImageProvider";
import { resolveContext } from "@/lib/mcp/resolver";
import { getSessionSnapshot, updateSession } from "@/lib/mcp/sessionStore";
import type { ChatTurn } from "@/lib/mcp/contracts";

function shouldGenerate(response: Shir0ChatResponse, anime: string | null, character: string | null) {
  return response.intent === "generate" || anime !== null || character !== null;
}

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

  const hasDetectedAnimeContext =
    context.anime !== null || context.character !== null || context.clarificationOptions.length > 0;

  const requestedCreativeOutput = hasDetectedAnimeContext;

  const assistantTurn: ChatTurn = {
    role: "assistant",
    content: shir0.reply,
  };

  const finalHistory = [...historyWithUser, assistantTurn].slice(-20);

  if (context.isAmbiguous && requestedCreativeOutput && context.anime) {
    const resolvedCharacter = pickCharacterForAnime(context.anime, context.clarificationOptions);

    if (resolvedCharacter) {
      const poemRequest: PoemRequest = {
        anime: context.anime,
        character: resolvedCharacter,
        length: "medium",
        tone: inferPoemTone(request.message, baseHistory),
      };

      const [poem, image] = await Promise.all([
        generatePoem(poemRequest),
        fetchAnimeImage(context.anime, resolvedCharacter),
      ]);

      const response: DispatchResponse = {
        shir0,
        poem,
        image,
      };

      persistSession(request.sessionId, finalHistory, {
        resolvedContext: {
          anime: context.anime,
          character: resolvedCharacter,
        },
        pendingClarification: [],
      });

      return response;
    }
  }

  if (context.isAmbiguous && requestedCreativeOutput) {
    const clarificationOptions = context.clarificationOptions.slice(0, 3);
    const response: DispatchResponse = {
      shir0: {
        reply:
          "I found a few possible anime-character matches. Pick one and I will compose something for it.",
        intent: "clarify",
        clarificationOptions,
      },
      poem: null,
      image: null,
    };

    persistSession(request.sessionId, finalHistory, {
      pendingClarification: clarificationOptions,
    });

    return response;
  }

  if (!requestedCreativeOutput || !shouldGenerate(shir0, context.anime, context.character)) {
    const response: DispatchResponse = {
      shir0,
      poem: null,
      image: null,
    };

    persistSession(request.sessionId, finalHistory, {
      resolvedContext:
        context.anime && context.character ? { anime: context.anime, character: context.character } : null,
      pendingClarification: [],
    });

    return response;
  }

  if (!context.anime || !context.character) {
    const clarificationOptions = context.clarificationOptions.slice(0, 3);
    const response: DispatchResponse = {
      shir0: {
        reply:
          "I can craft a poem once we lock both anime and character. Which anime-character pair did you mean?",
        intent: "clarify",
        clarificationOptions,
      },
      poem: null,
      image: null,
    };

    persistSession(request.sessionId, finalHistory, {
      pendingClarification: clarificationOptions,
    });

    return response;
  }

  const poemRequest: PoemRequest = {
    anime: context.anime,
    character: context.character,
    length: "medium",
    tone: inferPoemTone(request.message, baseHistory),
  };

  const [poem, image] = await Promise.all([
    generatePoem(poemRequest),
    fetchAnimeImage(context.anime, context.character),
  ]);

  const response: DispatchResponse = {
    shir0,
    poem,
    image,
  };

  persistSession(request.sessionId, finalHistory, {
    resolvedContext: {
      anime: context.anime,
      character: context.character,
    },
    pendingClarification: [],
  });

  return response;
}
