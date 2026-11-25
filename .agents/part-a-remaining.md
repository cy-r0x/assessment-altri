# Part A — remaining

## Still open

1. **Feedback must change the next recommendations**  
   Brief: *“New feedback changes the next set of recommendations.”*  
   Thumbs up/down (+ comments) persist via `POST /feedback`, but `get_recommendations` does not read feedback when ranking or filtering. After a reaction, the ordered list should change (e.g. boost likes, demote/hide dislikes — exact policy is ours to choose and document).

## Done (Part A checklist)

| Requirement | Status |
|---|---|
| Stack: Next.js/TS/shadcn/Tailwind + FastAPI | Done |
| Deal math (cash needed, debt, CF, CoC) | Done + tests |
| Hard filters (budget / avoid / beds / pencil) | Done + tests |
| Rank by `main_focus` + explanation | Done + ranking tests |
| `GET /clients`, `/clients/{id}`, `/recommendations`, `POST /feedback` | Done |
| Client summary UI | Done |
| Ranked deals with cash needed + CoC L/M/H + explanation | Done |
| Filtered-out list + reason | Done |
| Thumbs up/down with optional comment; list refresh | Done (persist + UI; ranking not yet feedback-aware) |
| Tests on deal math + hard filters / ranking | Done (`test_deal_math`, `test_feedback`, `test_recommendations`) |

## Not Part A (brief submission / Part B)

- Part B: use comments, call summaries, market data to improve recs
- Docker Compose / one-command start
- Submission README (≤2 pages)
- Demo video + AI notes / cost
