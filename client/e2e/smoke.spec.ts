import { expect, test } from "@playwright/test";

test.describe("STR Search smoke", () => {
  test("lists clients and paginates", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Clients" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Priya S\./ })).toBeVisible();
    await page.getByRole("link", { name: "Next" }).click();
    await expect(page).toHaveURL(/\?page=2/);
    await expect(page.getByText("2 /")).toBeVisible();
  });

  test("opens client detail with profile and feedback", async ({ page }) => {
    await page.goto("/clients/C-03");
    await expect(page.getByRole("heading", { name: "Elena and Joe R." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Feedback" })).toBeVisible();
    await expect(page.getByText("Markets")).toBeVisible();
    await expect(page.getByText(/Charlotte/)).toBeVisible();
  });

  test("API clients endpoint is healthy", async ({ request }) => {
    const res = await request.get("http://127.0.0.1:8000/api/v1/clients?page=1&limit=3");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.message).toContain("Clients");
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(body.data.length).toBeGreaterThan(0);
  });
});
