#!/bin/sh

echo "🚀 Booting container..."

echo "📦 Running production migration..."
bun run db:deploy

echo "🚀 Starting compiled server..."
exec ./server