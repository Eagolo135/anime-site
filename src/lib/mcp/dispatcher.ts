import type {
  DispatchCarryState,
  DispatchRequest,
  DispatchResponse,
  PoemRequest,
} from "@/lib/mcp/contracts";
import { generateShir0Reply } from "@/lib/providers/llmShir0Provider";
import { generatePoem } from "@/lib/providers/llmPoemProvider";
import { fetchAnimeImage } from "@/lib/providers/jikanImageProvider";
import { resolveContext } from "@/lib/mcp/resolver";
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

function createCarryState(
  options: {
    resolvedContext?: DispatchCarryState["resolvedContext"];
    pendingClarification?: DispatchCarryState["pendingClarification"];
  } = {}
): DispatchCarryState {
  return {
    resolvedContext: options.resolvedContext ?? null,
    pendingClarification: options.pendingClarification ?? [],
  };
}

export async function dispatchMcpRequest(request: DispatchRequest): Promise<DispatchResponse> {
  const baseHistory = request.history ?? [];
  const carryState = request.carryState ?? createCarryState();

  const shir0 = await generateShir0Reply(request.message, baseHistory);
  const context = resolveContext(request.message, {
    pendingClarification: carryState.pendingClarification,
    resolvedContext: carryState.resolvedContext,
    allowCarryForward: true,
  });

  // Merge LLM-extracted context as fallback when static resolver misses
  const resolvedAnime = context.anime ?? shir0.extractedContext?.anime ?? null;
  const resolvedCharacter = context.character ?? shir0.extractedContext?.character ?? null;

  if (context.isAmbiguous && context.clarificationOptions.length > 0 && !resolvedAnime && !resolvedCharacter) {
    return {
      shir0: {
        ...shir0,
        intent: "clarify",
        clarificationOptions: context.clarificationOptions,
      },
      poem: null,
      image: null,
      carryState: createCarryState({
        pendingClarification: context.clarificationOptions,
      }),
    };
  }

  // No anime or character detected anywhere — chat only
  if (!resolvedAnime && !resolvedCharacter) {
    return {
      shir0,
      poem: null,
      image: null,
      carryState: createCarryState(),
    };
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

  return {
    shir0,
    poem,
    image,
    carryState: createCarryState({
      resolvedContext: { anime, character },
      pendingClarification: [],
    }),
  };
}
