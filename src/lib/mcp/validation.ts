import type { ChatTurn } from "@/lib/mcp/contracts";

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
