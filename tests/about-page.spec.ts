import { expect, test } from "@playwright/test";

test("about page explains usage and tools", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "About" }).click();

  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { name: "About This Site" })).toBeVisible();
  await expect(page.getByText("How To Use It")).toBeVisible();
  await expect(page.getByText("MCP Tools In This App")).toBeVisible();
  await expect(page.getByText("Dispatch tool:")).toBeVisible();
});
