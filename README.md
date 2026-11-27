# assessment-altri

## Structure

- `client/` — Next.js frontend
- `server/` — FastAPI backend
- `data/` — seed data (`seed.sql` + JSON)

## One-command start (Docker)

Requires Docker Desktop / Compose.

```bash
docker compose up --build
```

| Service | URL |
| --- | --- |
| Client | http://localhost:3000 |
| API | http://localhost:8000 |
| Postgres | internal only (`str` / `str` / `str_search` on host `db`) |

On every `docker compose up`, the `seed` service loads [`data/seed.sql`](data/seed.sql). If clients already exist, it skips. To force a full re-seed:

```bash
docker compose down -v
docker compose up --build
```

### Tests (server)

```bash
cd server
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt pytest
PYTHONPATH=. pytest
```

## Local development (without Docker)

### Client

```bash
cd client
cp .env.example .env   # optional
npm install
npm run dev
```

### Server

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Point DATABASE_URL at a running Postgres with seed.sql applied
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## How recommendations work

Part A is implemented as specified, because STR Search defined the math and the hard rules so submissions can be compared. The same house is scored again for each client.

Cash needed is the down payment, plus closing costs, plus every setup item with a 10% overrun buffer. Debt service is the yearly cost of a 30-year fixed loan on the amount left after the down payment, at that deal's rate. Cash flow at low, mid, and high revenue is revenue minus operating expenses, the co-host fee, and debt service. Cash-on-cash is that cash flow divided by cash needed.

A deal is dropped when cash needed is over budget (flexible clients may go 10% over), the place is on the client's avoid list, bedrooms are under the minimum, or it does not pencil. Penciling means low cash-on-cash of at least 3%. A lifestyle client only needs low cash flow of zero or more.

What remains is sorted by the client's main focus: mid cash-on-cash for cash flow, year-one tax savings for tax, market appreciation for appreciation, and setting rank for lifestyle. A stated market preference only changes order, so a preferred place sorts ahead of an equal return elsewhere. A thumbs-down removes that deal. A thumbs-up sorts it first. Each kept deal gets a short explanation of why it ranked where it did.

The rules stay in code, and the numbers stay on the screen, so a rep can check a recommendation against the brief.

## What I researched

The brief asks for the yearly payment on a 30-year fixed loan and does not spell out the formula. I looked up standard mortgage amortization. The rate on the deal is treated as a yearly rate. The monthly rate is that rate divided by 12, the payment is the usual fixed-loan formula over 360 months, and debt service is that payment times 12. A zero rate falls back to the loan divided by 30 years.

That changed the implementation. The stored rate is divided by 12 before the monthly payment is calculated. Treating it as a monthly rate would push almost every deal under the 3% line.

## Assumptions

Interest rates in the seed data are yearly decimals. `0.07` means 7% a year.

Town and market names do not always match. "St. Augustine" and "Saint Augustine", or "Smokies" and "Smoky Mountains", show up as different strings for the same place. I treated that as free-text entry. A rep or a client can type a place, rather than pick from a fixed list of markets. Matching is therefore loose: a preference counts when one label contains the other, with a special case for "Florida" and the state `FL`. Record ids are unchanged.

A thumbs-down means "do not show this deal again." The comment is stored and shown, and it does not yet change the rank of other deals.

## What I would ask before version two

How does a client, a call, a deal, and a reaction move from onboarding to the analyst, to the rep, and back to the portal? I want that path before adding scale. Edge cases sit on the boundaries between those steps: a budget that changes on a later call, a town that is not in the market list, a second reaction on the same house. If I only see the seed tables, I will miss the ones that happen in the handoff.

## What I would build next

Market preference is a set of string checks. That holds for fourteen markets and a few nicknames. It will not hold once places are typed freely and the catalog grows. I would give each deal an explicit market, and keep aliases in their own table, so older rows can be migrated when a town is attached later. New rows would be accepted with messy names, and the ranker would keep using the link.

The brief invites AI, and I would use it on call summaries and comments once that path exists. The model would propose a few constraints, each tied to a sentence, run once per client and stored. Cost then stays flat as deals and history grow. Budget, avoid lists, bedrooms, and the pencil rule would remain in code.

That flow has to separate the vote from the sentence. A thumbs-up can come with a complaint, and a thumbs-down can come with "great house, bad timing." The vote decides whether that deal stays on the list. The sentence decides whether the client disliked the house, the place, or only the timing. Only the place and the timing should affect other deals. Scanning the full history on every request will not survive once each client has a long trail of calls and reactions.
