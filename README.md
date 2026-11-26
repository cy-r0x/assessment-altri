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
