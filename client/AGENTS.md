<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Client agent guide — assessment-altri

Internal **acquisitions-rep** tool for STR Search: pick a client, see ranked deals with client-specific math, filter exclusions, and record feedback.

## Installed skills

| Skill | Source | Why |
| --- | --- | --- |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills) (~199k★, ~1.2M installs) | Distinctive UI guidance; avoid generic AI aesthetics |

Path: `.agents/skills/frontend-design/`

When building or reshaping UI, follow that skill’s process (ground in subject matter → deliberate type/color → critique against AI-default tells).

## Recommended UI design pattern: Master–Detail

Use a **master–detail** layout (not a multi-widget dashboard):

1. **Master (left / top):** searchable, paginated client list (short summaries).
2. **Detail (main):** selected client profile + ranked recommendations + excluded deals + feedback actions.

Why this fits:

- One primary job per screen: help the rep work **one client** at a time.
- Matches the API shape (`/clients` → `/clients/{id}` → `/clients/{id}/recommendations` + `POST /feedback`).
- Keeps CoC / cash-needed numbers and “why excluded” next to the person they apply to.

### Supporting patterns (secondary)

- **Progressive disclosure:** ranked deals first; excluded deals collapsed until opened.
- **Optimistic feedback:** thumbs up/down updates the detail pane and refreshes recommendations.

## Stack notes

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui (per brief).
- Talk to the API at `/api/v1/*` with `{ message, data, pagination? }` envelopes.

## Color palette — “Cedar & Fog Ledger”

Calm underwriting desk with a nod to STR destinations (woods / lake), not a marketing site.

| Token | Hex | Use |
| --- | --- | --- |
| `--background` | `#EEF2F0` | App canvas (cool mist, not cream) |
| `--surface` / `--surface-raised` | `#F7F9F8` / `#FFFFFF` | Panels / cards-for-interaction |
| `--foreground` | `#1A2421` | Primary text |
| `--foreground-muted` | `#5A6B64` | Secondary labels |
| `--primary` | `#2F5D50` | Actions, selection, brand |
| `--accent` | `#3D6E8C` | Links, lake/info accents |
| `--success` | `#2F6B4F` | Thumbs up, healthy CoC |
| `--warning` | `#9A6B1F` | Soft risk / borderline pencil |
| `--danger` | `#8F3D3D` | Thumbs down, excluded, CoC low fail |
| `--border` | `#C5D0CB` | Dividers |

Defined in `src/app/globals.css` as CSS variables + Tailwind theme tokens (`bg-primary`, `text-foreground-muted`, etc.).

## Anti-patterns for this product

- Marketing landing / hero-first layout (this is a work tool).
- Dense analytics dashboard competing with recommendations.
- Generic purple gradients / Inter-only “AI SaaS” look.
- Cream `#F4F1EA` + terracotta `#D97757` (common AI default).
- Dark mode / neon glow as the default shell.
