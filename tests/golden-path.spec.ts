import { expect, test } from "@playwright/test";

test("intro to search golden path", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Poetry Archive" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Search archive" })).toBeVisible();
  await expect(page.getByText("AI site mascot")).toBeVisible();

  const searchInput = page.getByRole("textbox", { name: "Search archive" });
  await searchInput.fill("Spike");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page.getByText('Showing results for "Spike"')).toBeVisible();
  await expect(page.getByText("Cowboy Bebop")).toBeVisible();

  await page.getByRole("button", { name: "Stacks" }).click();
  await expect(page.getByRole("button", { name: "Stacks" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );

  await searchInput.fill("zzzzzz");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(
    page.getByText("No poem echoes found for that query. Try anime title, character, or a phrase.")
  ).toBeVisible();
});
