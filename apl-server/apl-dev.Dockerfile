FROM oven/bun:latest

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl

COPY package.json bun.lockb ./
RUN bun install

COPY . .

RUN bun run db:generate

EXPOSE 3000

CMD ["sh", "-c", "bun run dev"]

