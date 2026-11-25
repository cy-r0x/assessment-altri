# Design System Master: STR Search

> Adapted from ui-ux-pro-max for the existing light Airbnb-inspired product.
> Keep light mode, Rausch accent, and Roboto. Do not flip to dark OLED or Cinzel.

## Product
- **Type:** Advisor tool — STR deal matching for acquisitions reps
- **Platform:** Web (Next.js + Tailwind + shadcn)
- **Style:** Minimalism & Swiss — clean, functional, high contrast, grid-based
- **Density:** 7/10 (comfortable dashboard density)
- **Motion:** 3/10 (subtle 150–250ms transitions; respect `prefers-reduced-motion`)

## Colors (product tokens)
| Role | Hex | Notes |
|------|-----|-------|
| Background | `#FEFEFE` → soft wash | Light atmosphere, not flat gray slab |
| Surface / Card | `#FFFFFF` | Soft shadow, no heavy bezels on media cards |
| Foreground | `#222222` | Primary text ≥4.5:1 |
| Muted text | `#6A6A6A` | Secondary |
| Border | `#DDDDDD` | Visible dividers |
| Primary / CTA | `#FF385C` | Rausch — use sparingly (brand mark, destructive accent) |
| Accent / ink | `#222222` | Pagination filled hover, price pills |
| Success | `#008A05` | CoC / positive |
| Danger | `#E25275` | Budget fail / dislike |

## Typography
- **Family:** Roboto (next/font) — product decision; keep for consistency
- **Scale:** 12 / 13 / 14 / 15 / 16 / 18 / 22 / 24 / 28 / 32
- **Weights:** 400 body, 500 headings & emphasis
- **Headings:** medium, tight tracking

## Layout
- Max width list pages: `1760px`; detail: `1400px`
- Page gutters: `px-5 md:px-8 xl:px-10` (lists), `px-6 md:px-10` (detail)
- Sticky header `h-16` + `scroll-padding-top: 4.5rem`
- 4/8px spacing rhythm; card radius `14px`; pills `28px`

## Interaction (checklist)
- `cursor-pointer` on all clickable elements
- Hover: 150–200ms color/shadow; optional `-translate-y-px` (disabled under reduced motion)
- Active: slight press feedback (`active:scale-[0.99]`)
- Focus: visible `ring-2 ring-ring ring-offset-2`
- Loading: skeletons matching layout + `aria-busy`
- Decorative icons: `aria-hidden="true"`
- Empty states: short message + next action when possible

## Anti-patterns
- Dark mode as default
- Purple/indigo gradient themes
- Emoticons as icons
- Hover-only primary actions
- Layout-shifting hover transforms on dense tables
- Missing focus rings (`outline-none` without replacement)
