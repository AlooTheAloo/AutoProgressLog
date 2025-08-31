FROM node:lts-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

COPY . .

RUN npm install -g bun

RUN bun install

RUN bun build \
  --compile \
  --minify-whitespace \
  --minify-syntax \
  --target bun \
  --outfile server \
  ./src/index.ts

RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]