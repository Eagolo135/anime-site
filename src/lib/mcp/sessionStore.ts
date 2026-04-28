import type { ChatTurn, ClarificationOption } from "@/lib/mcp/contracts";

type ResolvedContext = {
  anime: string;
  character: string;
};

export type ConversationSession = {
  id: string;
  lastSeenAt: number;
  history: ChatTurn[];
  resolvedContext: ResolvedContext | null;
  pendingClarification: ClarificationOption[];
};

const SESSION_TTL_MS = 45 * 60 * 1000;
const sessions = new Map<string, ConversationSession>();

function now(): number {
  return Date.now();
}

function trimHistory(turns: ChatTurn[]): ChatTurn[] {
  return turns.slice(-20);
}

function purgeExpiredSessions() {
  const cutoff = now() - SESSION_TTL_MS;

  for (const [key, session] of sessions.entries()) {
    if (session.lastSeenAt < cutoff) {
      sessions.delete(key);
    }
  }
}

function createSession(id: string): ConversationSession {
  return {
    id,
    lastSeenAt: now(),
    history: [],
    resolvedContext: null,
    pendingClarification: [],
  };
}

export function getSessionSnapshot(id: string): ConversationSession | null {
  purgeExpiredSessions();

  const existing = sessions.get(id);
  if (!existing) {
    return null;
  }

  existing.lastSeenAt = now();

  return {
    ...existing,
    history: [...existing.history],
    pendingClarification: [...existing.pendingClarification],
    resolvedContext: existing.resolvedContext ? { ...existing.resolvedContext } : null,
  };
}

export function updateSession(
  id: string,
  updater: (current: ConversationSession) => ConversationSession
): ConversationSession {
  purgeExpiredSessions();

  const current = sessions.get(id) ?? createSession(id);
  const updated = updater({
    ...current,
    history: [...current.history],
    pendingClarification: [...current.pendingClarification],
    resolvedContext: current.resolvedContext ? { ...current.resolvedContext } : null,
  });

  const normalized: ConversationSession = {
    ...updated,
    id,
    lastSeenAt: now(),
    history: trimHistory(updated.history),
    pendingClarification: updated.pendingClarification.slice(0, 3),
  };

  sessions.set(id, normalized);
  return {
    ...normalized,
    history: [...normalized.history],
    pendingClarification: [...normalized.pendingClarification],
    resolvedContext: normalized.resolvedContext ? { ...normalized.resolvedContext } : null,
  };
}

export function clearSession(id: string): void {
  sessions.delete(id);
}
