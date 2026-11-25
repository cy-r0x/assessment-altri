# Redesign the recommendation card

## Goal
The ranked deal card on `/clients/[id]` is cramped: the "CoC low / mid / high" cell wraps its label and its three values over two lines, the three equal grey boxes give no hierarchy, and nothing tells the rep at a glance which number matters. Redesign the card so a rep reads, in order: rank + where it is → the return (mid CoC) and its spread → cash needed / cash flow → why it's ranked here.

## Context
- Read first: `client/AGENTS.md`, `client/.agents/skills/airbnb-ui-skills/SKILL.md` (the design system to follow), `client/src/app/globals.css` (tokens).
- File to change: `client/src/components/recommendations/RecommendationList.tsx` — only `RecommendationCard`, `Metric`, `Coc` and helpers inside it. Leave the section header, empty state and "Filtered out" list alone.
- `client/src/lib/api.ts` has `formatBudget`, `formatCoc`. Types in `client/src/lib/types.ts` (`Recommendation`, `DealMetrics`).
- E2E test that must keep passing: `client/e2e/recommendations.spec.ts`.

## Constraints (from airbnb-ui-skills + AGENTS.md)
- Light mode only; existing tokens only (`bg-surface`, `bg-surface-muted`, `border-border`, `text-foreground`, `text-foreground-muted`, `text-foreground-subtle`, `text-success`, `text-danger`, `bg-primary`/`text-primary` = Rausch). No new colors, no gradients.
- Font weights: regular/medium only (no `font-semibold`/`font-bold`). `tabular-nums` on every number. Do not change letter-spacing (remove `tracking-wide` from anything you touch).
- Radii: card `rounded-[14px]`, pills `rounded-full`. Spacing on the 4px grid.
- Max two boxes deep: card → content. **No grey boxes inside the card** for metrics.
- No new animation. Keep the existing hover lift/shadow on the card link, and the focus ring.
- No new dependencies. Server component (no `"use client"`).
- Whole card stays one `Link` to `/deals/{id}`.

## Steps
1. **Card layout** — replace `RecommendationCard` body with these rows (`flex flex-col`, `p-4`, `gap-3`):

   a. **Header row** (`flex items-start justify-between gap-3`):
      - Left: rank pill + location line stacked:
        - Rank pill `#1`: `rounded-full px-2 py-0.5 text-[12px] font-medium tabular-nums`. Rank 1 uses `bg-primary text-primary-foreground`; others `bg-surface-muted text-foreground`.
        - Next to the pill (same line): market label (market.name, fallback `city, state`) in `text-[13px] text-foreground-muted`, then ` · ` + setting title-cased if present.
        - Below: address (fallback deal id) `text-[15px] font-medium text-foreground truncate`.
        - Below: `D-116 · 5 bd · 4 ba` plus ` · Turnkey` / ` · Needs work` when `deal.turnkey != null`, `text-[13px] text-foreground-subtle tabular-nums`. Use text "bd"/"ba" (drop the BedDouble/Bath icons).
      - Right: price `text-[15px] font-medium tabular-nums`, and under it `text-[12px] text-foreground-subtle` "list price".

   b. **Return block** (`border-t border-border pt-3`):
      - Left: big mid CoC `text-[24px] leading-none font-medium tabular-nums`, `text-success` when ≥ 0.08, `text-foreground` when ≥ 0, `text-danger` when < 0. Under it label `text-[12px] text-foreground-muted` "Cash-on-cash (mid)".
      - Right (flex-1, `min-w-0`): `CocRange` (step 2) showing low → high.

   c. **Money row**: two columns `grid grid-cols-2 gap-3`, no backgrounds, separated by a `border-l border-border pl-3` on the second:
      - "Cash needed" → `formatBudget(metrics.cash_needed)`
      - "Cash flow / yr (mid)" → `formatBudget(metrics.cash_flow.mid)`, `text-danger` if negative.
      - Label `text-[12px] text-foreground-muted`, value `text-[15px] font-medium tabular-nums text-foreground`.

   d. **Why** (`mt-auto border-t border-border pt-3`): explanation `text-[13px] leading-snug text-foreground-muted text-pretty line-clamp-3`, with `title={explanation}`.

2. **`CocRange` component** (in the same file), props `{ low: number | null; mid: number | null; high: number | null }`:
   - A shared fixed scale so cards are comparable: `SCALE_MIN = 0`, `SCALE_MAX = 0.30`. `pos(v) = clamp((v - SCALE_MIN) / (SCALE_MAX - SCALE_MIN), 0, 1) * 100` as a percent.
   - Track: `relative h-1.5 rounded-full bg-surface-muted`. Filled span from `pos(low)` to `pos(high)`: absolute, `bg-foreground/25 rounded-full`. Mid marker: absolute `size-2.5 rounded-full bg-foreground ring-2 ring-surface`, centred on `pos(mid)` (`-translate-x-1/2 top-1/2 -translate-y-1/2`). Use inline `style={{ left, width }}` for positions.
   - Under the track: `flex justify-between text-[12px] tabular-nums text-foreground-muted` with `Low {formatCoc(low)}` and `High {formatCoc(high)}`; a negative low gets `text-danger`.
   - If any of low/mid/high is null, render just the text line without the track.
   - `aria-label` on the track wrapper: `CoC range low X, mid Y, high Z` (`role="img"`).

3. Delete the now-unused `Metric` and `Coc` helpers and the `BedDouble`/`Bath` imports if unused. Keep `titleCase`.

4. **Update the e2e test** `client/e2e/recommendations.spec.ts` to match the new labels: replace the `"CoC low / mid / high"` assertion with `"Cash-on-cash (mid)"`. Keep the exact-match check for the mid CoC value (`{ exact: true }`) — the big number renders exactly e.g. `19.8%`. Keep the card-count locator working: cards still contain `#<n>` text; if the `/^#\d+/` filter no longer matches because the card's text starts differently, change it to `.filter({ hasText: /#\d+/ })` scoped to `a[href^="/deals/"]` that contain "Cash-on-cash".

## Verification
- `cd client && npx tsc --noEmit` and `npx eslint src e2e` — clean.
- API (:8000) and Next dev (:3000) are already running in the background; if not reachable, start them: `cd server && .venv/bin/uvicorn app.main:app --port 8000` and `cd client && npm run dev` (background).
- `cd client && npx playwright test` — all 4 pass.
- Take a screenshot of one card for review: add nothing to the repo; use the existing full-page screenshot the spec writes to `client/test-results/client-C-01-recommendations.png` and mention it in Notes.

## Progress
<!-- Subagents update this section only -->
- [x] 1
- [x] 2
- [x] 3
- [x] 4
- [x] Verification

## Notes
<!-- Subagents: deviations, conflicts with the code, open questions, verification output -->

Files changed:
- client/src/components/recommendations/RecommendationList.tsx (new RecommendationCard, CocRange; removed Metric, Coc, ReactNode and lucide imports)
- client/e2e/recommendations.spec.ts (label assertion to "Cash-on-cash (mid)"; card filter to /#\d+/)

Deviations: none. In CocRange, if mid is null the text-only fallback renders (plan: any of low/mid/high null). Big mid CoC uses text-foreground when null.

Verification: tsc clean; eslint clean; API/Next already up (200/200); playwright 4 passed.
Screenshot: client/test-results/client-C-01-recommendations.png (not visually inspected by me).
