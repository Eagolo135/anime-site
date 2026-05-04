import { expect, test } from "@playwright/test";

test("intro to search golden path", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("AI site mascot")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Shir0 conversation input" })).toBeVisible();

  await expect(page.getByText("Cowboy Bebop")).toBeVisible();

  await page.getByRole("button", { name: "Stacks" }).click();
  await expect(page.getByRole("button", { name: "Stacks" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
});
