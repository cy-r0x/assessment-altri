# Client page: list recommended deals

## Goal
On `/clients/[id]`, call `GET /api/v1/clients/{id}/recommendations` and render the ranked deals below the existing Client Info | Feedback row. Layout:

```
Client Info | Feedback        (existing, unchanged)
------------------------------
Recommendations (header + counts)
------------------------------
Ranked deal cards (grid)
------------------------------
Excluded deals (compact list: deal id + rule)
```

## Context
- Read first: `client/AGENTS.md` (design rules: Airbnb-style, light mode, tabular-nums for money, ~14px card radius, tokens like `bg-surface`, `text-foreground-muted`, `border-border`). Next.js here is a newer version — check `client/node_modules/next/dist/docs/` if you touch any Next API beyond a plain async server component + `fetch`.
- `client/src/app/clients/[id]/page.tsx` — current page (server component, fetches client).
- `client/src/lib/api.ts` — fetch helpers + `formatBudget`, `formatPct`.
- `client/src/lib/types.ts` — types.
- `client/src/components/deals/DealList.tsx` — card styling to mirror.
- Backend shape: `server/app/service/clients.py` `get_recommendations` (response wrapped as `{ message, data }`).

Response `data` shape:
```json
{
  "client_id": "C-01",
  "main_focus": "cash_flow",
  "recommendations": [
    {
      "deal": { /* DealSummary */ },
      "market": { "id": "M-01" | null, "name": "Poconos" | null, "setting": "lake_mountain" | null, "annual_appreciation": 0.04 | null },
      "metrics": {
        "cash_needed": 123456.7,
        "debt_service": 23456.7,
        "cash_flow": { "low": 1.0, "mid": 2.0, "high": 3.0 },
        "coc": { "low": 0.05 | null, "mid": 0.07 | null, "high": 0.09 | null }
      },
      "explanation": "Best cash-on-cash fit: ..."
    }
  ],
  "excluded": [
    { "deal_id": "D-101", "rule": "Cash needed exceeds budget", "metrics": { ... optional, ignore } }
  ]
}
```

Files to change/create:
- `client/src/lib/types.ts`
- `client/src/lib/api.ts`
- `client/src/components/recommendations/RecommendationList.tsx` (new)
- `client/src/app/clients/[id]/page.tsx`

## Constraints
- Do NOT change the existing profile/feedback section markup.
- No backend changes. No new npm dependencies (shadcn migration is a separate open issue — use plain Tailwind + existing tokens).
- No feedback form in this task.
- Server component only; no client-side state needed.
- If the recommendations fetch fails, the client page must still render; show an inline "Couldn't load recommendations" message in the section instead of `notFound()`.

## Steps
1. **Types** (`types.ts`): add
   ```ts
   export type Range3<T> = { low: T; mid: T; high: T };
   export type RecommendationMarket = { id: string | null; name: string | null; setting: string | null; annual_appreciation: number | null };
   export type DealMetrics = { cash_needed: number; debt_service: number; cash_flow: Range3<number>; coc: Range3<number | null> };
   export type Recommendation = { deal: DealSummary; market: RecommendationMarket; metrics: DealMetrics; explanation: string };
   export type ExcludedDeal = { deal_id: string; rule: string };
   export type RecommendationsResponse = { client_id: string; main_focus: string | null; recommendations: Recommendation[]; excluded: ExcludedDeal[] };
   ```
2. **API** (`api.ts`): add `fetchRecommendations(clientId: string): Promise<ApiSuccess<RecommendationsResponse>>`, same pattern as `fetchClient` (`cache: "no-store"`, throw `Failed to load recommendations (${status})`). Add `formatCoc(value: number | null | undefined): string` → one decimal, e.g. `"6.4%"`, `"—"` for null.
3. **Component** `RecommendationList.tsx` — props `{ data: RecommendationsResponse }`:
   - Section header: `<h2>Recommendations</h2>` + muted subline `"{n} ranked · {m} excluded · ranked for {formatFocus(main_focus)}"`.
   - Ranked grid (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`, gap-3), each card a `Link` to `/deals/{deal.id}` styled like DealList cards, containing:
     - Rank badge `#1`, `#2`… (pill), address (or id), purchase price right-aligned.
     - Meta line: deal id · beds · baths · market name (fallback `city, state`) · setting (title-cased, underscores→spaces) if present.
     - Metrics block (3 cells, `tabular-nums`): **Cash needed** `formatBudget`; **CoC low / mid / high** as three values `formatCoc` each; **Cash flow (mid)** `formatBudget`. Negative values get `text-danger`.
     - Explanation text, `text-[13px] text-foreground-muted`, `text-pretty`.
   - Empty state when `recommendations` is empty: "No deals pass this client's hard rules."
   - Excluded section: `<h3>Filtered out</h3>` + list rows: deal id as `Link` to `/deals/{deal_id}` + rule text. Compact (one line per row, `text-[13px]`), in a bordered `bg-surface` card. Hide section if empty.
4. **Page** (`clients/[id]/page.tsx`): after the existing fetch, fetch recommendations in a try/catch (do it in parallel with `fetchClient` via `Promise.allSettled` or a separate try — client 404 still calls `notFound()`). Below the existing grid `div`, add `<section className="relative mt-8">` rendering `RecommendationList` or the error message.

## Verification
- `cd client && npx tsc --noEmit` — no errors.
- `cd client && npm run lint` — no new errors.
- If the API is running on :8000 (`curl -s localhost:8000/api/v1/clients/C-01/recommendations | head -c 300`), run `npm run build` or load `/clients/C-01` and confirm ranked cards + filtered-out list render. If the API isn't running, say so in Notes; don't try to start Postgres.

## Progress
<!-- Subagents update this section only -->
- [x] 1
- [x] 2
- [x] 3
- [x] 4
- [x] Verification

## Notes
<!-- Subagents: deviations, conflicts with the code, open questions, verification output -->

Files changed: `client/src/lib/types.ts`, `client/src/lib/api.ts`, `client/src/app/clients/[id]/page.tsx`, new `client/src/components/recommendations/RecommendationList.tsx`.

- `formatCoc` treats the input as a fraction (0.064 -> "6.4%"), consistent with the example values in the response shape.
- Page uses `Promise.allSettled`; client rejection -> `notFound()`, recommendations rejection -> inline "Couldn't load recommendations" card inside the section.
- `node_modules` was missing, so I ran `npm ci` (no dependency changes), then `npx next typegen` (generates `LayoutProps`; needed for `src/app/layout.tsx`, unrelated to this task).
- Verification: `npx tsc --noEmit` clean (after typegen). `npx eslint src` clean. `npm run lint` (bare `eslint`) reports 15 errors / 330 warnings, all from generated files outside `src` (e.g. minified bundles); none from our files.
- API on :8000 is not running (curl returned nothing), so the runtime render of `/clients/C-01` and `npm run build` were not verified. Did not start Postgres.
