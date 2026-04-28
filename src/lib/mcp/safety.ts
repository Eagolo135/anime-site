type SafetyResult = {
  allowed: boolean;
  reason: string | null;
};

const MAX_MESSAGE_LENGTH = 600;
const BLOCKED_PATTERNS: RegExp[] = [
  /\b(kill|murder|bomb|terror|shoot)\b/i,
  /\b(self-harm|suicide|hurt myself)\b/i,
  /\b(hate|racial slur|ethnic cleansing)\b/i,
  /\b(explicit sexual|porn|rape)\b/i,
];

export function evaluateMessageSafety(message: string): SafetyResult {
  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return {
      allowed: false,
      reason: "empty",
    };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      allowed: false,
      reason: "too_long",
    };
  }

  const matched = BLOCKED_PATTERNS.find((pattern) => pattern.test(trimmed));
  if (matched) {
    return {
      allowed: false,
      reason: "unsafe_content",
    };
  }

  return {
    allowed: true,
    reason: null,
  };
}

export function blockedSafetyReply(reason: string): string {
  if (reason === "too_long") {
    return "Your message is very long. Please shorten it and I can help step by step.";
  }

  return "I can help with anime and poetry, but I cannot assist with unsafe requests.";
}
