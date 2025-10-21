#!/usr/bin/env bash
set -euo pipefail

# Usage:
# export DATABASE_URL='postgresql://user:pass@host:port/db'
# ./apply_schema.sh

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: Please set DATABASE_URL environment variable to your Postgres connection string."
  echo "Example: export DATABASE_URL='postgresql://postgres:password@host:5432/postgres'"
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found. On macOS you can install it with Homebrew:"
  echo "  brew install libpq"
  echo "Then add it to your PATH (example):"
  echo "  echo 'export PATH=\"$(brew --prefix libpq)/bin:\$PATH\"' >> ~/.zshrc && source ~/.zshrc"
  exit 1
fi

SCHEMA_FILE="$(dirname "$0")/schema.sql"
if [ ! -f "$SCHEMA_FILE" ]; then
  echo "Could not find $SCHEMA_FILE"
  exit 1
fi

echo "Applying schema from $SCHEMA_FILE to $DATABASE_URL ..."
psql "$DATABASE_URL" -f "$SCHEMA_FILE"
echo "Done."
