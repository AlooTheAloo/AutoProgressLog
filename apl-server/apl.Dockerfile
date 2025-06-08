FROM oven/bun:latest

WORKDIR /app

# Install OS dependencies (e.g., OpenSSL for Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Copy and install dependencies first
COPY package.json bun.lockb ./
RUN bun install --verbose

# Copy the rest of the app
COPY . .

# Prisma client generation at build time (NEVER at runtime)
RUN bunx prisma generate

# Set default port (Heroku assigns $PORT)
ENV PORT=3000
EXPOSE 3000

RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]