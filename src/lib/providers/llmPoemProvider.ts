import type { PoemRequest, PoemResponse } from "@/lib/mcp/contracts";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const RELIABLE_FALLBACK_MODEL = "gpt-4o-mini";

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

function fallbackPoem(request: PoemRequest): PoemResponse {
  const length = request.length ?? "medium";
  return {
    poem: `${request.character} walks through ${request.anime} like a lantern in rain,\ncarrying sparks of memory,\na quiet storm turning into song.`,
    meta: {
      tone: request.tone ?? "dramatic",
      length,
      provider: "fallback",
    },
  };
}

export async function generatePoem(request: PoemRequest): Promise<PoemResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("[poem.openai.missing_api_key]");
    return fallbackPoem(request);
  }

  const tone = request.tone ?? "dramatic";
  const length = request.length ?? "medium";
  const prompt = `Write a ${length} ${tone} poem inspired by ${request.character} from ${request.anime}. Keep it original and avoid quoting copyrighted text.`;

  const callModel = async (model: string) => {
    return fetch(OPENAI_API_URL, {
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
            content:
              "You generate concise, original anime-inspired poetry. Return JSON with keys poem and meta (tone,length,provider).",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });
  };

  try {
    let response = await callModel(DEFAULT_MODEL);

    if (!response.ok && DEFAULT_MODEL !== RELIABLE_FALLBACK_MODEL) {
      console.warn("[poem.openai.model_failed]", {
        model: DEFAULT_MODEL,
        status: response.status,
      });
      response = await callModel(RELIABLE_FALLBACK_MODEL);
    }

    if (!response.ok) {
      console.warn("[poem.openai.request_failed]", {
        model: RELIABLE_FALLBACK_MODEL,
        status: response.status,
      });
      return fallbackPoem(request);
    }

    const payload = (await response.json()) as unknown;
    const outputText = extractOutputText(payload);

    if (!outputText) {
      console.warn("[poem.openai.empty_output]");
      return fallbackPoem(request);
    }

    const parsed = JSON.parse(outputText) as PoemResponse;
    return {
      poem: parsed.poem,
      meta: {
        tone: parsed.meta?.tone ?? tone,
        length: (parsed.meta?.length as "short" | "medium" | "long") ?? length,
        provider: "llm",
      },
    };
  } catch (error) {
    console.warn("[poem.openai.exception]", {
      message: error instanceof Error ? error.message : "unknown_error",
    });
    return fallbackPoem(request);
  }
}
