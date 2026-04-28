import type { PoemRequest, PoemResponse } from "@/lib/mcp/contracts";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const RELIABLE_FALLBACK_MODEL = "gpt-4o-mini";

function extractOutputText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const typed = payload as {
    output_text?: unknown;
    output?: Array<{
      content?: Array<{
        text?: string;
        type?: string;
      }>;
    }>;
  };

  if (typeof typed.output_text === "string" && typed.output_text.trim().length > 0) {
    return typed.output_text;
  }

  const nestedText = typed.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => typeof content.text === "string" && content.text.trim().length > 0)?.text;

  return nestedText ?? null;
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
        input: [
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
        text: {
          format: {
            type: "json_schema",
            name: "poem_response",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                poem: { type: "string" },
                meta: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    tone: { type: "string" },
                    length: { type: "string", enum: ["short", "medium", "long"] },
                    provider: { type: "string", enum: ["llm", "fallback"] },
                  },
                  required: ["tone", "length", "provider"],
                },
              },
              required: ["poem", "meta"],
            },
          },
        },
      }),
    });
  };

  try {
    let response = await callModel(DEFAULT_MODEL);

    if (!response.ok && DEFAULT_MODEL !== RELIABLE_FALLBACK_MODEL) {
      response = await callModel(RELIABLE_FALLBACK_MODEL);
    }

    if (!response.ok) {
      return fallbackPoem(request);
    }

    const payload = (await response.json()) as unknown;
    const outputText = extractOutputText(payload);

    if (!outputText) {
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
  } catch {
    return fallbackPoem(request);
  }
}
