# Placeholder photos for deals (Lorem Picsum)

## Goal
Give every deal an Airbnb-style listing photo using Lorem Picsum, so cards read like listings. Same deal = same photo everywhere.

## Context
- Read first: `client/AGENTS.md`; Next 16 image docs at `client/node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` (note: `priority` is deprecated → use `preload`; `remotePatterns` config).
- Files to change:
  - `client/next.config.ts`
  - `client/src/lib/api.ts`
  - `client/src/components/recommendations/RecommendationList.tsx` (`RecommendationCard`)
  - `client/src/components/deals/DealList.tsx` (deal cards on `/deals`)
  - `client/src/app/deals/[id]/page.tsx` (detail hero)

## Constraints
- Use `next/image` (not `<img>`), so lint stays clean.
- Seeded URLs so a deal's photo is stable: `https://picsum.photos/seed/{dealId}/{w}/{h}`. Picsum redirects to `fastly.picsum.photos`; allow both hosts.
- Card images 4:3, requested at 800×600 (2× a ~400×300 slot for sharp retina). Detail hero 2:1 at 1600×800 (same seed → same photo, different crop).
- Airbnb look: image flush at top of card, inherits card radius (`overflow-hidden` on the card), no border on the image, `object-cover`, `bg-surface-muted` placeholder behind it.
- Don't change the existing card text content/layout except moving it below the image. No new dependencies. No animation beyond what exists (the skill forbids new animation).

## Steps
1. `next.config.ts`: add
   ```ts
   images: {
     remotePatterns: [
       { protocol: "https", hostname: "picsum.photos", pathname: "/seed/**" },
       { protocol: "https", hostname: "fastly.picsum.photos" },
     ],
   },
   ```
   Keep all existing options.
2. `api.ts`: add
   ```ts
   export function dealImageUrl(dealId: string, width = 800, height = 600): string {
     return `https://picsum.photos/seed/${encodeURIComponent(dealId)}/${width}/${height}`;
   }
   ```
3. `RecommendationCard`: the card `Link` gets `overflow-hidden` and loses its own padding; add at the top
   ```tsx
   <div className="relative aspect-[4/3] w-full bg-surface-muted">
     <Image src={dealImageUrl(deal.id)} alt={`Photo of ${deal.address ?? deal.id}`} fill
       sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" preload={rank <= 3} />
   </div>
   ```
   Wrap the existing content (header, return block, money row) in a `div` with the padding/gap the `Link` had (`flex flex-1 flex-col gap-3 p-4`). Move the rank pill so it overlays the image's top-left (`absolute left-3 top-3`, keep its colors; for non-#1 use `bg-surface text-foreground shadow-sm` so it's readable on a photo), and remove it from the header row (the market line stays where it was).
4. `DealList.tsx` cards: same pattern — `overflow-hidden` on the `Link`, 4:3 `Image` on top (`preload` for the first 3 items on the page), existing content wrapped in a padded div with the previous padding.
5. `deals/[id]/page.tsx`: at the top of the main `section` (before the id/address block), add a hero image `relative aspect-[2/1] w-full overflow-hidden rounded-[12px] bg-surface-muted mb-5` with `<Image src={dealImageUrl(deal.id, 1600, 800)} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" preload alt=... />`.

## Verification
- `cd client && npx tsc --noEmit && npx eslint src e2e` — clean.
- next.config changes need a dev-server restart: the dev server may be running in the background on :3000 — stop it (`pkill -f "next dev"`), start again in background (`npm run dev`), wait until `curl -s -o /dev/null -w "%{http_code}" localhost:3000` returns 200. API on :8000 should already be up; if not: `cd server && .venv/bin/uvicorn app.main:app --port 8000` (background).
- `cd client && npx playwright test` — all 4 pass.
- Check images actually load: `curl -s -o /dev/null -w "%{http_code}\n" "localhost:3000/_next/image?url=https%3A%2F%2Fpicsum.photos%2Fseed%2FD-116%2F800%2F600&w=828&q=75"` → 200. Record result in Notes.

## Progress
<!-- Subagents update this section only -->
- [x] 1
- [x] 2
- [x] 3
- [x] 4
- [x] 5
- [x] Verification

## Notes
<!-- Subagents: deviations, conflicts with the code, open questions, verification output -->
- Files changed: client/next.config.ts, client/src/lib/api.ts, client/src/components/recommendations/RecommendationList.tsx, client/src/components/deals/DealList.tsx, client/src/app/deals/[id]/page.tsx.
- Deviation: ran `prettier --print-width 100 --write` on RecommendationList.tsx and DealList.tsx to reindent the newly wrapped content (HEAD versions were already stable under that setting), so those diffs are larger than the logical change. No prettier config exists in the repo.
- Rank pill moved to the image overlay; the market line stays in the header, the pill is removed from the header row.
- `dealImageUrl` was placed just before `formatBudget` in api.ts.
- Verification: `tsc --noEmit` and `eslint src e2e` clean. Dev server restarted (the first `pkill -f "next dev"` also killed my own shell, so I started it again separately). Playwright: 4 passed. Image check: `/_next/image?url=...picsum.photos/seed/D-116/800/600&w=828&q=75` returned 200.
