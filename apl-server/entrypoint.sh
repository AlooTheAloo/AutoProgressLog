#!/bin/sh

set -e

echo "Running Entrypoint Script..."

# Use NODE_ENV or default to development
MODE=${NODE_ENV:-development}
echo "Environment: $MODE"

if [ "$MODE" = "production" ]; then
  echo "Production environment detected. Skipping dev migrations."
else
  echo "Development environment detected. Resetting DB and applying migrations..."
  bunx prisma migrate dev
  echo "Generating Prisma client..."
  bunx prisma generate
fi

echo "Starting app..."
bun run start
