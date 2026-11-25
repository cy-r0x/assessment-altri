import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:8000/api/v1";

test("client page lists ranked recommendations and filtered-out deals", async ({ page, request }) => {
  const res = await request.get(`${API}/clients/C-01/recommendations`);
  expect(res.ok()).toBeTruthy();
  const { data } = await res.json();

  await page.goto("/clients/C-01");

  await expect(page.getByRole("heading", { name: "Recommendations" })).toBeVisible();
  await expect(
    page.getByText(`${data.recommendations.length} ranked · ${data.excluded.length} excluded`),
  ).toBeVisible();

  // Cards render in API order with rank badges and client-specific metrics.
  const first = data.recommendations[0];
  const firstCard = page.locator(`a[href="/deals/${first.deal.id}"]`).filter({ hasText: "#1" });
  await expect(firstCard).toBeVisible();
  await expect(firstCard.getByText("Cash needed")).toBeVisible();
  await expect(firstCard.getByText("Cash-on-cash (mid)")).toBeVisible();
  await expect(firstCard.getByText(`${(first.metrics.coc.mid * 100).toFixed(1)}%`, { exact: true })).toBeVisible();

  const cards = page.locator("ul li a").filter({ hasText: /#\d+/ });
  await expect(cards).toHaveCount(data.recommendations.length);

  // Filtered-out list shows each excluded deal with its rule.
  await expect(page.getByRole("heading", { name: "Filtered out" })).toBeVisible();
  const ex = data.excluded[0];
  const exRow = page.locator("li").filter({ has: page.getByRole("link", { name: ex.deal_id, exact: true }) });
  await expect(exRow.getByText(ex.rule)).toBeVisible();

  await page.screenshot({ path: "test-results/client-C-01-recommendations.png", fullPage: true });
});
