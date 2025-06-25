#!/bin/sh

echo "🚀 Booting container..."

echo "📦 Running migrations..."
bun run db:generate
bun run dev

echo "i am here now"