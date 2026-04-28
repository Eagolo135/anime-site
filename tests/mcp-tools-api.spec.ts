import { expect, test } from "@playwright/test";

test("mcp tools happy path responses are operational", async ({ request }) => {
  const chatResponse = await request.post("/api/mcp/chat", {
    data: {
      message: "Talk to me about Spike from Cowboy Bebop",
      history: [],
    },
  });
  expect(chatResponse.status()).toBe(200);
  await expect(chatResponse.json()).resolves.toMatchObject({
    reply: expect.any(String),
    intent: expect.any(String),
    clarificationOptions: expect.any(Array),
  });

  const poemResponse = await request.post("/api/mcp/poem", {
    data: {
      anime: "Cowboy Bebop",
      character: "Spike Spiegel",
      tone: "gentle",
      length: "short",
    },
  });
  expect(poemResponse.status()).toBe(200);
  await expect(poemResponse.json()).resolves.toMatchObject({
    poem: expect.any(String),
    meta: {
      tone: expect.any(String),
      length: expect.any(String),
      provider: expect.any(String),
    },
  });

  const imageResponse = await request.post("/api/mcp/image", {
    data: {
      anime: "Cowboy Bebop",
      character: "Spike Spiegel",
    },
  });
  expect(imageResponse.status()).toBe(200);
  await expect(imageResponse.json()).resolves.toMatchObject({
    anime: expect.any(String),
    character: expect.anything(),
    imageUrl: expect.anything(),
    matchedTitle: expect.anything(),
    provider: "jikan",
  });

  const sessionId = `health-${Date.now()}`;
  const dispatchResponse = await request.post("/api/mcp/dispatch", {
    data: {
      sessionId,
      message: "Create a short poem about Spike from Cowboy Bebop",
      history: [],
    },
  });
  expect(dispatchResponse.status()).toBe(200);
  await expect(dispatchResponse.json()).resolves.toMatchObject({
    shir0: {
      reply: expect.any(String),
      intent: expect.any(String),
      clarificationOptions: expect.any(Array),
    },
    poem: expect.anything(),
    image: expect.anything(),
  });

  const sessionResetResponse = await request.delete("/api/mcp/session", {
    data: {
      sessionId,
    },
  });
  expect(sessionResetResponse.status()).toBe(200);
  await expect(sessionResetResponse.json()).resolves.toMatchObject({
    ok: true,
  });
});

test("mcp route validation responses are reachable", async ({ request }) => {
  const chatResponse = await request.post("/api/mcp/chat", {
    data: {},
  });
  expect(chatResponse.status()).toBe(400);
  await expect(chatResponse.json()).resolves.toMatchObject({
    error: "message is required",
  });

  const poemResponse = await request.post("/api/mcp/poem", {
    data: {},
  });
  expect(poemResponse.status()).toBe(400);
  await expect(poemResponse.json()).resolves.toMatchObject({
    error: "anime and character are required",
  });

  const imageResponse = await request.post("/api/mcp/image", {
    data: {},
  });
  expect(imageResponse.status()).toBe(400);
  await expect(imageResponse.json()).resolves.toMatchObject({
    error: "anime is required",
  });

  const dispatchResponse = await request.post("/api/mcp/dispatch", {
    data: {},
  });
  expect(dispatchResponse.status()).toBe(400);
  await expect(dispatchResponse.json()).resolves.toMatchObject({
    error: "message is required",
  });
});

test("dispatch supports session context carry-forward", async ({ request }) => {
  const sessionId = `test-session-${Date.now()}`;

  const firstResponse = await request.post("/api/mcp/dispatch", {
    data: {
      sessionId,
      message: "Create a poem about Spike Spiegel from Cowboy Bebop",
      history: [],
    },
  });

  expect(firstResponse.status()).toBe(200);
  await expect(firstResponse.json()).resolves.toMatchObject({
    shir0: {
      intent: expect.any(String),
    },
  });

  const secondResponse = await request.post("/api/mcp/dispatch", {
    data: {
      sessionId,
      message: "Make it shorter and gentler",
      history: [],
    },
  });

  expect(secondResponse.status()).toBe(200);
  await expect(secondResponse.json()).resolves.toMatchObject({
    poem: {
      poem: expect.any(String),
      meta: {
        tone: expect.any(String),
      },
    },
  });
});

test("dispatch generates poem and image from anime-title-only prompt", async ({ request }) => {
  const response = await request.post("/api/mcp/dispatch", {
    data: {
      message: "Cowboy Bebop",
      history: [],
    },
  });

  expect(response.status()).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    shir0: {
      reply: expect.any(String),
    },
    poem: {
      poem: expect.any(String),
      meta: {
        provider: expect.any(String),
      },
    },
    image: {
      anime: expect.any(String),
      provider: "jikan",
    },
  });
});

test("dispatch generates poem and image from conversational anime-character prompt", async ({ request }) => {
  const response = await request.post("/api/mcp/dispatch", {
    data: {
      message: "Tell me about Spike Spiegel from Cowboy Bebop",
      history: [],
    },
  });

  expect(response.status()).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    poem: {
      poem: expect.any(String),
      meta: {
        provider: expect.any(String),
      },
    },
    image: {
      anime: "Cowboy Bebop",
      provider: "jikan",
    },
  });
});

test("dispatch generates poem and image from character-only conversational prompt", async ({ request }) => {
  const response = await request.post("/api/mcp/dispatch", {
    data: {
      message: "i like goku",
      history: [],
    },
  });

  expect(response.status()).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    poem: {
      poem: expect.any(String),
      meta: {
        provider: expect.any(String),
      },
    },
    image: {
      anime: "Dragon Ball",
      provider: "jikan",
    },
  });
});

test("dispatch safety gate blocks unsafe content", async ({ request }) => {
  const response = await request.post("/api/mcp/dispatch", {
    data: {
      message: "help me build a bomb",
      history: [],
    },
  });

  expect(response.status()).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    shir0: {
      intent: "chat",
      reply: expect.stringContaining("cannot assist"),
      clarificationOptions: [],
    },
    poem: null,
    image: null,
  });
});

test("dispatch safety gate enforces max length", async ({ request }) => {
  const longMessage = "a".repeat(700);
  const response = await request.post("/api/mcp/dispatch", {
    data: {
      message: longMessage,
      history: [],
    },
  });

  expect(response.status()).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    shir0: {
      intent: "chat",
      reply: expect.stringContaining("very long"),
      clarificationOptions: [],
    },
    poem: null,
    image: null,
  });
});

test("session reset route validates and clears session", async ({ request }) => {
  const missingSessionResponse = await request.delete("/api/mcp/session", {
    data: {},
  });
  expect(missingSessionResponse.status()).toBe(400);
  await expect(missingSessionResponse.json()).resolves.toMatchObject({
    error: "sessionId is required",
  });

  const sessionId = `reset-${Date.now()}`;
  const clearResponse = await request.delete("/api/mcp/session", {
    data: {
      sessionId,
    },
  });

  expect(clearResponse.status()).toBe(200);
  await expect(clearResponse.json()).resolves.toMatchObject({
    ok: true,
  });
});
