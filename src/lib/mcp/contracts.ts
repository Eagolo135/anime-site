export type ChatRole = "user" | "assistant";

export type ChatTurn = {
  role: ChatRole;
  content: string;
};

export type Shir0Intent = "chat" | "clarify" | "generate";

export type ClarificationOption = {
  anime: string;
  character: string;
  confidence: number;
};

export type ResolvedContext = {
  anime: string;
  character: string;
};

export type DispatchCarryState = {
  resolvedContext: ResolvedContext | null;
  pendingClarification: ClarificationOption[];
};

export type Shir0ChatRequest = {
  message: string;
  history?: ChatTurn[];
  context?: {
    anime?: string | null;
    character?: string | null;
  };
};

export type Shir0ChatResponse = {
  reply: string;
  intent: Shir0Intent;
  clarificationOptions: ClarificationOption[];
  extractedContext?: {
    anime: string | null;
    character: string | null;
  };
};

export type PoemRequest = {
  anime: string;
  character: string;
  tone?: string | null;
  length?: "short" | "medium" | "long";
};

export type PoemResponse = {
  poem: string;
  meta: {
    tone: string;
    length: "short" | "medium" | "long";
    provider: "llm" | "fallback";
  };
};

export type ImageRequest = {
  anime: string;
  character?: string | null;
};

export type ImageResponse = {
  anime: string;
  character: string | null;
  imageUrl: string | null;
  matchedTitle: string | null;
  provider: "jikan";
};

export type DispatchRequest = {
  message: string;
  history?: ChatTurn[];
  sessionId?: string;
  carryState?: Partial<DispatchCarryState>;
};

export type DispatchResponse = {
  shir0: Shir0ChatResponse;
  poem: PoemResponse | null;
  image: ImageResponse | null;
  carryState: DispatchCarryState;
};
