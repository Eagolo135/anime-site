import type { ChatTurn, ClarificationOption, DispatchCarryState, ResolvedContext } from "@/lib/mcp/contracts";

export function getTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getHistory(value: unknown): ChatTurn[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => {
      if (typeof item !== "object" || item === null) {
        return false;
      }

      const role = (item as { role?: unknown }).role;
      const content = (item as { content?: unknown }).content;
      return (role === "user" || role === "assistant") && typeof content === "string";
    })
    .map((item) => {
      const typed = item as { role: "user" | "assistant"; content: string };
      return {
        role: typed.role,
        content: typed.content,
      };
    })
    .slice(-20);
}

export function getSessionId(value: unknown): string | null {
  const trimmed = getTrimmedString(value);

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, 120);
}

function getResolvedContext(value: unknown): ResolvedContext | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const anime = getTrimmedString((value as { anime?: unknown }).anime);
  const character = getTrimmedString((value as { character?: unknown }).character);

  if (!anime || !character) {
    return null;
  }

  return {
    anime,
    character,
  };
}

function getClarificationOptions(value: unknown): ClarificationOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => {
      if (typeof item !== "object" || item === null) {
        return false;
      }

      const anime = getTrimmedString((item as { anime?: unknown }).anime);
      const character = getTrimmedString((item as { character?: unknown }).character);
      const confidence = (item as { confidence?: unknown }).confidence;

      return anime !== null && character !== null && typeof confidence === "number";
    })
    .map((item) => ({
      anime: getTrimmedString((item as { anime?: unknown }).anime) as string,
      character: getTrimmedString((item as { character?: unknown }).character) as string,
      confidence: Number((item as { confidence: number }).confidence.toFixed(2)),
    }))
    .slice(0, 3);
}

export function getDispatchCarryState(value: unknown): DispatchCarryState {
  if (typeof value !== "object" || value === null) {
    return {
      resolvedContext: null,
      pendingClarification: [],
    };
  }

  return {
    resolvedContext: getResolvedContext((value as { resolvedContext?: unknown }).resolvedContext),
    pendingClarification: getClarificationOptions(
      (value as { pendingClarification?: unknown }).pendingClarification
    ),
  };
}
