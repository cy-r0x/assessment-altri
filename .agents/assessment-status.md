# Assessment status

Take-home: STR Search client deal recommendations (Part A required, Part B open).

## Part A

**Status: complete** — see [part-a-remaining.md](./part-a-remaining.md).

Core: deal math, hard filters, focus ranking + explanations, feedback that changes the next list, rep UI, tests, Docker Compose + seed.

## Part B

**Status: not started** — open problem (comments, call summaries, markets → better recs). No committed approach yet.

## Submission leftovers

| Item | Status |
|---|---|
| `docker compose up` | Done |
| Server tests (`pytest`) | Done (document command in README) |
| README ≤2 pages (approach, research, assumptions, V2 questions) | Stub |
| ~10 min demo video + AI wrong-turn | Not started |
| Public git repo link | Local only until pushed |

## Run

```bash
docker compose up --build
# client http://localhost:3000
# api    http://localhost:8000
```

```bash
cd server && PYTHONPATH=. .venv/bin/python -m pytest
```

## Key paths

| Area | Path |
|---|---|
| Recommendations / filters | `server/app/service/clients.py` |
| Feedback upsert / undo | `server/app/service/feedback.py` |
| Deal math | `server/app/service/deal_math.py` |
| Service types | `server/app/service/types.py` |
| ORM models | `server/app/db/models/` |
| Rec cards / modal | `client/src/components/recommendations/` |
| Seed | `data/seed.sql` + `scripts/seed-if-empty.sh` |
