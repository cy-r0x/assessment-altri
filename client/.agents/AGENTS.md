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

## Anti-patterns for this product

- Marketing landing / hero-first layout (this is a work tool).
- Dense analytics dashboard competing with recommendations.
- Generic purple gradients / Inter-only “AI SaaS” look — prefer a calm, finance-adjacent work surface with clear hierarchy for numbers.
