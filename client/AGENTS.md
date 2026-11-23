<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Client agent guide — assessment-altri

Internal **acquisitions-rep** tool for STR Search: pick a client, see ranked deals with client-specific math, filter exclusions, and record feedback.

## Installed skills

| Skill | Path | Role |
| --- | --- | --- |
| `airbnb-ui-skills` | `.agents/skills/airbnb-ui-skills/` | **Primary visual system** (Airbnb) |
| `design-taste-frontend` | `.agents/skills/design-taste-frontend/` | Anti-slop taste / finish gate |
| `impeccable` | `.agents/skills/impeccable/` | Anti-slop craft |
| `emil-design-eng` | `.agents/skills/emil-design-eng/` | Motion / density polish |
| `frontend-design` | `.agents/skills/frontend-design/` | General distinctive UI (fallback) |

## Design pattern: Airbnb search / listing grid

Follow Airbnb’s product UI (via `airbnb-ui-skills`), adapted for a rep desk:

1. **Sticky top bar** — logo left, pill “search” center, rep chip right.
2. **Listing-style card grid** — clients as cards (avatar block + name + budget + markets), soft hover lift/shadow.
3. **Detail route** — `/clients/[id]` for profile, recommendations, feedback (not a marketing landing).

Constraints from the Airbnb skill:

- Light mode only (`#FEFEFE` base)
- Inter, 4px grid, ~12px card radius, ~28px pills
- Brand accent: Rausch `#FF385C`
- Body ~15px; headings medium weight; `tabular-nums` for money/IDs

## Stack notes

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui (per brief).
- API: `/api/v1/*` with `{ message, data, pagination? }`.
- Open issues: see `.agents/open-issues.md`.

## Anti-patterns

- Fake “ledger / SaaS dashboard” chrome.
- Purple gradients, neon dark mode, cream+terracotta AI defaults (unless matching a named brand system we chose — here we chose Airbnb).
- Decorative serif “studio” branding for an internal tool.
