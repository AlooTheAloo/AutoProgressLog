# ---------- Build Stage ----------
FROM oven/bun AS build

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

COPY package.json bun.lockb ./
RUN bun install

COPY . .

RUN bun run db:generate

RUN bun build \
  --compile \
  --minify-whitespace \
  --minify-syntax \
  --target bun \
  --outfile server \
  ./src/index.ts

# ---------- Runtime Stage ----------
FROM oven/bun:slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl


# Copy all necessary files for runtime
COPY --from=build /app/server .
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma /node_modules/@prisma
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/bun.lockb ./bun.lockb
COPY --from=build /app/entrypoint.sh .

RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
