# MCP Contracts

Last updated: 2026-04-28

## Overview
This document defines the V1 contract for Shir0 orchestration and tool interactions.

## Tool: `shir0-chat`
Request:
```json
{
  "message": "string",
  "history": [{ "role": "user|assistant", "content": "string" }],
  "context": {
    "anime": "string|null",
    "character": "string|null"
  }
}
```

Response:
```json
{
  "reply": "string",
  "intent": "chat|clarify|generate",
  "clarificationOptions": [
    { "anime": "string", "character": "string", "confidence": 0.0 }
  ]
}
```

## Tool: `poem-creator`
Request:
```json
{
  "anime": "string",
  "character": "string",
  "tone": "string|null",
  "length": "short|medium|long"
}
```

Response:
```json
{
  "poem": "string",
  "meta": {
    "tone": "string",
    "length": "short|medium|long",
    "provider": "llm|fallback"
  }
}
```

## Tool: `anime-image-fetch`
Request:
```json
{
  "anime": "string",
  "character": "string|null"
}
```

Response:
```json
{
  "anime": "string",
  "character": "string|null",
  "imageUrl": "string|null",
  "matchedTitle": "string|null",
  "provider": "jikan"
}
```

## Tool: `mcp-dispatch`
Request:
```json
{
  "message": "string",
  "history": [{ "role": "user|assistant", "content": "string" }]
}
```

Response:
```json
{
  "shir0": {
    "reply": "string",
    "intent": "chat|clarify|generate",
    "clarificationOptions": []
  },
  "poem": { "poem": "string", "meta": {} },
  "image": { "imageUrl": "string|null" }
}
```

## Ambiguity Policy
- Show at most 3 clarification options.
- If no confident options exist, ask one concise follow-up question.

## Failure Policy
- Tool timeout fallback:
  - `shir0-chat`: graceful apology + prompt to retry
  - `poem-creator`: fallback short poem template
  - `anime-image-fetch`: null image + placeholder strategy in UI
- Dispatcher still returns a structurally valid response object.
