# assessment-altri

## Structure

- `client/` — Next.js frontend
- `server/` — FastAPI backend
- `data/` — seed data

## Client

```bash
cd client
npm install
npm run dev
```

## Server

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
