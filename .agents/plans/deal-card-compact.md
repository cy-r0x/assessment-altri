# Compact deal cards on /deals

## Goal
On `/deals` the cards are too big (3 columns of 4:3 photos ~550px wide) and the photo dominates the small, muted text under it. Make cards smaller, give the text more weight, drop "Mid rev", and show the price as a dark badge.

## Context
- Read first: `client/AGENTS.md`, `client/.agents/skills/airbnb-ui-skills/SKILL.md`.
- File to change: `client/src/components/deals/DealList.tsx` (only the grid `ul` and the card inside `deals.map`). Leave header and `PaginationLink` untouched.
- Do NOT touch `RecommendationList.tsx` or the deal detail page.

## Constraints
- Existing tokens only (`bg-foreground` is #222 = the dark block, `text-primary-foreground` = white). Font weights regular/medium only. `tabular-nums` on numbers. No new animation; keep the existing hover lift/shadow and focus ring on the card `Link`.
- Keep `next/image` with `fill`, `object-cover`, `dealImageUrl(deal.id)`, `preload` for the first items.
- No new dependencies. Don't run prettier on other files.

## Steps
1. **Grid** → `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`. Update `sizes` to `"(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"`. `preload={index < 4}`.
2. **Image** → keep 4:3 but card is now ~400px wide at xl (matches the 400×300 target). Image container stays `relative aspect-[4/3] w-full bg-surface-muted`.
   - **Price badge** overlaid bottom-left of the image: `absolute bottom-3 left-3 rounded-[8px] bg-foreground/90 px-2.5 py-1 text-[15px] font-medium tabular-nums text-primary-foreground` showing `formatBudget(deal.purchase_price)`. Remove the price from the text area.
3. **Text block** below the image: `flex flex-1 flex-col gap-1 px-4 pb-4 pt-3`, in this order:
   a. **Location**: `MapPin` (size 14) + `city, state` — `flex items-center gap-1.5 text-[13px] text-foreground-muted`, truncate.
   b. **Address**: `text-[16px] font-medium text-foreground truncate` (fallback to deal id).
   c. **Specs**: `flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-foreground` with icon+value pairs, icons `text-foreground-muted` size 15:
      - `BedDouble` + `{bedrooms} bd`
      - `Bath` + `{baths} ba`
      - `LandPlot` (lucide) + `{lot_acres} ac` — only when `deal.lot_acres != null`
      - then a `·` separator and `Turnkey` / `Needs work` in `text-foreground-muted` when `turnkey != null`.
   d. **Deal id** small at the end: `mt-1 text-[12px] tabular-nums text-foreground-subtle`.
   Remove the `midRevenue` variable and the "Mid rev" span.
4. Imports: add `LandPlot` to the lucide import; remove anything unused.

## Verification
- `cd client && npx tsc --noEmit && npx eslint src e2e` — clean.
- Dev server :3000 and API :8000 should be running; if not, start them in background (`cd client && npm run dev`; `cd server && .venv/bin/uvicorn app.main:app --port 8000`).
- `cd client && npx playwright test` — all 4 pass.

## Progress
<!-- Subagents update this section only -->
- [x] 1
- [x] 2
- [x] 3
- [x] 4
- [x] Verification

## Notes
<!-- Subagents: deviations, conflicts with the code, open questions, verification output -->
- Changed: `client/src/components/deals/DealList.tsx` only (grid, card, `LandPlot` import; removed `midRevenue`).
- No deviations. `deal.lot_acres` exists in `DealSummary` (`number | null`).
- Verification: `npx tsc --noEmit && npx eslint src e2e` clean; dev server :3000 and API :8000 were already up; `npx playwright test` 4 passed.
