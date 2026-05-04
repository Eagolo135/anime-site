import { expect, test, type Page } from "@playwright/test";

async function sendShir0Message(page: Page, text: string) {
  const input = page.getByRole("textbox", { name: "Shir0 conversation input" });
  const submit = page.getByRole("button", { name: "Send message" });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await input.fill(text);

    const value = await input.inputValue();
    const isDisabled = await submit.isDisabled();

    if (value === text && !isDisabled) {
      await submit.click();
      return;
    }

    await page.waitForTimeout(150);
  }

  await expect(input).toHaveValue(text);
  await expect(submit).toBeEnabled();
  await submit.click();
}

test("shir0 keeps conversational chat UI without forcing poem fallback", async ({ page }) => {
  await page.route("**/api/mcp/dispatch", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        shir0: {
          reply: "I am doing great. Want recommendations, lore, or a custom poem next?",
          intent: "chat",
          clarificationOptions: [],
        },
        poem: null,
        image: null,
      }),
    });
  });

  await page.goto("/");
  await sendShir0Message(page, "Hey Shir0, how are you?");

  const transcript = page.getByLabel("Shir0 conversation transcript");

  await expect(transcript).toBeVisible();
  await expect(transcript.getByText("Hey Shir0, how are you?")).toBeVisible();
  await expect(transcript.getByText("I am doing great. Want recommendations, lore, or a custom poem next?")).toBeVisible();
  await expect(page.getByText("No poem arrived this time. Ask again and Shir0 will try another verse.")).toHaveCount(0);
});

test("random conversation ends with anime talk and shows generated poem plus image", async ({ page }) => {
  let dispatchCount = 0;
  let poemToolCalls = 0;
  let imageToolCalls = 0;

  await page.route("**/api/mcp/poem", async (route) => {
    poemToolCalls += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        poem: "Neon rain on midnight glass,\nSpike leans into tomorrow.",
        meta: {
          tone: "cinematic",
          length: "short",
          provider: "llm",
        },
      }),
    });
  });

  await page.route("**/api/mcp/image", async (route) => {
    imageToolCalls += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        anime: "Cowboy Bebop",
        character: "Spike Spiegel",
        imageUrl: "https://cdn.myanimelist.net/images/anime/4/19644.jpg",
        matchedTitle: "Cowboy Bebop",
        provider: "jikan",
      }),
    });
  });

  await page.route("**/api/mcp/dispatch", async (route) => {
    dispatchCount += 1;

    if (dispatchCount === 1) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          shir0: {
            reply: "Nice. What are you in the mood for today?",
            intent: "chat",
            clarificationOptions: [],
          },
          poem: null,
          image: null,
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        shir0: {
          reply: "Great pick. I generated this right now.",
          intent: "generate",
          clarificationOptions: [],
        },
        poem: {
          poem: "Neon rain on midnight glass,\nSpike leans into tomorrow.",
          meta: {
            tone: "cinematic",
            length: "short",
            provider: "llm",
          },
        },
        image: {
          anime: "Cowboy Bebop",
          character: "Spike Spiegel",
          imageUrl: "https://cdn.myanimelist.net/images/anime/4/19644.jpg",
          matchedTitle: "Cowboy Bebop",
          provider: "jikan",
        },
      }),
    });
  });

  await page.goto("/");
  await sendShir0Message(page, "how's your day going?");
  await sendShir0Message(page, "Cowboy Bebop");

  await expect(page.getByLabel("Shir0 conversation transcript").getByText("Cowboy Bebop")).toBeVisible();

  const stage = page.getByLabel("Generated anime poem stage");
  await expect(stage).toBeVisible({ timeout: 15000 });
  await expect(stage.getByText(/Neon rain on midnight glass/i)).toBeVisible({ timeout: 15000 });
  await expect(stage.getByRole("img", { name: "Cowboy Bebop artwork" })).toBeVisible();

  expect(poemToolCalls).toBeGreaterThanOrEqual(1);
  expect(imageToolCalls).toBeGreaterThanOrEqual(1);
});
