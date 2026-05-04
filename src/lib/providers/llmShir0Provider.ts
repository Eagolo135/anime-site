import type { ChatTurn, Shir0ChatResponse } from "@/lib/mcp/contracts";

const AI_GATEWAY_URL = "https://api.vercel.ai/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "openai/gpt-4o-mini";
const RELIABLE_FALLBACK_MODEL = "openai/gpt-4o-mini";

function extractOutputText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const typed = payload as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = typed.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim().length > 0) {
    return content;
  }

  return null;
}

function inferConversationStyle(history: ChatTurn[]): string {
  const recentUserText = history
    .filter((turn) => turn.role === "user")
    .slice(-4)
    .map((turn) => turn.content.toLowerCase())
    .join(" ");

  if (/(short|brief|one line|quick)/.test(recentUserText)) {
    return "Keep replies concise and to the point.";
  }

  if (/(detail|deeper|explain|longer)/.test(recentUserText)) {
    return "Offer slightly richer detail while staying easy to read.";
  }

  if (/(joke|funny|playful|banter)/.test(recentUserText)) {
    return "Lean playful and witty when appropriate.";
  }

  return "Balance warmth with clear, natural dialogue.";
}

function fallbackShir0Response(message: string): Shir0ChatResponse {
  const prompt = message.trim().toLowerCase();

  if (/(hello|hi|hey|yo)\b/.test(prompt)) {
    return {
      reply: "Hey, I am here. Want to chat anime, get recommendations, or generate a poem with artwork?",
      intent: "chat",
      clarificationOptions: [],
    };
  }

  if (/(how are you|how's your day|hows your day)/.test(prompt)) {
    return {
      reply: "I am doing well and ready to talk anime. Tell me a title and I can generate a fresh poem and matching artwork.",
      intent: "chat",
      clarificationOptions: [],
    };
  }

  return {
    reply: "I am here with you. If you share an anime title, I can generate a fresh poem and matching artwork right away.",
    intent: "chat",
    clarificationOptions: [],
  };
}

export async function generateShir0Reply(
  message: string,
  history: ChatTurn[] = []
): Promise<Shir0ChatResponse> {
  const apiKey = process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    console.warn("[shir0.ai_gateway.missing_api_key]");
    return fallbackShir0Response(message);
  }

  const styleHint = inferConversationStyle(history);
  const systemPrompt = [
    "You are Shir0, an anime-focused assistant with a conversational style similar to modern chat assistants.",
    "Maintain natural back-and-forth flow and reference the current conversation context when useful.",
    styleHint,
    "Return strict JSON with keys reply, intent (chat|clarify|generate), clarificationOptions (array), extractedAnime (string or null), and extractedCharacter (string or null).",
    "For extractedAnime: detect any anime title mentioned in the user message — including abbreviations (DBZ=Dragon Ball Z, MHA=My Hero Academia, HxH=Hunter x Hunter, SAO=Sword Art Online, AOT=Attack on Titan, FMA=Fullmetal Alchemist, JJK=Jujutsu Kaisen), partial names, or casual references. Return the full canonical title or null if none present.",
    "For extractedCharacter: detect any anime character mentioned by name or nickname (Luffy=Monkey D. Luffy from One Piece, Naruto=Naruto Uzumaki, Goku=Son Goku, etc). Return the character full name or null if none present.",
    "Use intent=generate whenever an anime or character is mentioned. Use intent=clarify only when a name is truly ambiguous across multiple anime.",
  ].join(" ");

  const callModel = async (model: string) => {
    return fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...history.map((turn) => ({ role: turn.role, content: turn.content })),
          {
            role: "user",
            content: message,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });
  };

  try {
    let response = await callModel(DEFAULT_MODEL);

    if (!response.ok && DEFAULT_MODEL !== RELIABLE_FALLBACK_MODEL) {
      console.warn("[shir0.openai.model_failed]", {
        model: DEFAULT_MODEL,
        status: response.status,
      });
      response = await callModel(RELIABLE_FALLBACK_MODEL);
    }

    if (!response.ok) {
      console.warn("[shir0.openai.request_failed]", {
        model: RELIABLE_FALLBACK_MODEL,
        status: response.status,
      });
      return fallbackShir0Response(message);
    }

    const payload = (await response.json()) as unknown;
    const outputText = extractOutputText(payload);

    if (!outputText) {
      console.warn("[shir0.openai.empty_output]");
      return fallbackShir0Response(message);
    }

    const parsed = JSON.parse(outputText) as Shir0ChatResponse & {
      extractedAnime?: string | null;
      extractedCharacter?: string | null;
    };
    return {
      reply: parsed.reply,
      intent: parsed.intent,
      clarificationOptions: (parsed.clarificationOptions ?? []).slice(0, 3),
      extractedContext: {
        anime: parsed.extractedAnime ?? null,
        character: parsed.extractedCharacter ?? null,
      },
    };
  } catch (error) {
    console.warn("[shir0.openai.exception]", {
      message: error instanceof Error ? error.message : "unknown_error",
    });
    return fallbackShir0Response(message);
  }
}
