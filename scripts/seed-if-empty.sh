#!/bin/sh
# Apply data/seed.sql once. If clients (or any seed table) already has rows, skip.
set -eu

DB_HOST="${DB_HOST:-db}"
DB_USER="${POSTGRES_USER:-str}"
DB_NAME="${POSTGRES_DB:-str_search}"
export PGPASSWORD="${POSTGRES_PASSWORD:-str}"

echo "Waiting for Postgres at ${DB_HOST}..."
until pg_isready -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; do
  sleep 1
done

HAS_CLIENTS="$(
  psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -tAc \
    "SELECT to_regclass('public.clients') IS NOT NULL"
)"

if [ "$HAS_CLIENTS" = "t" ]; then
  ROW_COUNT="$(
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -tAc \
      "SELECT COUNT(*) FROM clients"
  )"
  if [ "${ROW_COUNT:-0}" -gt 0 ]; then
    echo "Seed data already present (${ROW_COUNT} clients); skipping."
    exit 0
  fi
  echo "Schema exists but is empty; resetting public schema before seed."
  psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -c \
    "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
fi

echo "Loading /seed.sql..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f /seed.sql
echo "Seed complete."
