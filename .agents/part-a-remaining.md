# Part A — remaining

## Still open

None. Part A functional gaps are closed.

## Feedback → recommendations (done)

- **Thumbs down** → deal soft-excluded into **Filtered out** with rule `Client disliked`
- **Undo** from Filtered out (same `down` again, no comment field) → feedback row deleted → deal returns to ranked list
- **Thumbs up** → deal boosted to front of recommendations
- Comments unchanged (modal on reaction)

## Done (Part A checklist)

| Requirement | Status |
|---|---|
| Stack: Next.js/TS/shadcn/Tailwind + FastAPI | Done |
| Deal math (cash needed, debt, CF, CoC) | Done + tests |
| Hard filters (budget / avoid / beds / pencil) | Done + tests |
| Rank by `main_focus` + explanation | Done + ranking tests |
| Feedback changes next recommendations | Done + tests |
| `GET /clients`, `/clients/{id}`, `/recommendations`, `POST /feedback` | Done |
| Client summary UI | Done |
| Ranked deals with cash needed + CoC L/M/H + explanation | Done |
| Filtered-out list + reason (+ dislike undo) | Done |
| Thumbs up/down with optional comment; list refresh | Done |
| Tests on deal math + hard filters / ranking / feedback effects | Done |

## Not Part A (brief submission / Part B)

- Part B: use comments, call summaries, market data to improve recs
- Docker Compose / one-command start
- Submission README (≤2 pages)
- Demo video + AI notes / cost
