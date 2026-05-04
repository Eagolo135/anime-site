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

test("shir0 orchestration renders clarify and fallback states", async ({ page }) => {
  let dispatchCount = 0;
  let poemToolCalls = 0;
  let imageToolCalls = 0;

  await page.route("**/api/mcp/poem", async (route) => {
    poemToolCalls += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        poem: "Sakura stands in dawn light,\npetals and resolve in one breath.",
        meta: {
          tone: "dramatic",
          length: "medium",
          provider: "llm",
        },
      }),
    });
  });

  await page.route("**/api/mcp/image", async (route) => {
    imageToolCalls += 1;

    if (imageToolCalls === 1) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          anime: "Naruto",
          character: "Sakura Haruno",
          imageUrl: null,
          matchedTitle: "Naruto",
          provider: "jikan",
        }),
      });
      return;
    }

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
            reply: "I found a few matches for Sakura.",
            intent: "clarify",
            clarificationOptions: [
              { anime: "Naruto", character: "Sakura Haruno", confidence: 0.93 },
              { anime: "Cardcaptor Sakura", character: "Sakura Kinomoto", confidence: 0.89 },
            ],
          },
          poem: null,
          image: null,
        }),
      });
      return;
    }

    if (dispatchCount === 2) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          shir0: {
            reply: "Perfect, I made a poem for Sakura Haruno.",
            intent: "generate",
            clarificationOptions: [],
          },
          poem: {
            poem: "Sakura stands in dawn light,\npetals and resolve in one breath.",
            meta: {
              tone: "dramatic",
              length: "medium",
              provider: "llm",
            },
          },
          image: {
            anime: "Naruto",
            character: "Sakura Haruno",
            imageUrl: null,
            matchedTitle: "Naruto",
            provider: "jikan",
          },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        shir0: {
          reply: "I found artwork, but poem generation was empty this pass.",
          intent: "generate",
          clarificationOptions: [],
        },
        poem: null,
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

  await sendShir0Message(page, "Sakura");

  await expect(page.getByRole("button", { name: "Sakura Haruno - Naruto" })).toBeVisible();

  await page.getByRole("button", { name: "Sakura Haruno - Naruto" }).click();

  const stage = page.getByLabel("Generated anime poem stage");
  await expect(stage.getByText("Sakura stands in dawn light,")).toBeVisible();

  await sendShir0Message(page, "Show me Spike");

  await expect(stage.getByText("Cowboy Bebop")).toBeVisible();
  await expect(stage.getByRole("img", { name: "Cowboy Bebop artwork" })).toBeVisible();
  expect(poemToolCalls).toBeGreaterThanOrEqual(1);
  expect(imageToolCalls).toBeGreaterThanOrEqual(2);
});
