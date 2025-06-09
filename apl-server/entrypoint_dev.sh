#!/bin/sh

echo "🚀 Booting container..."

echo "📦 Running production migration..."
bun run db:generate
bun run dev

echo "i am here now"