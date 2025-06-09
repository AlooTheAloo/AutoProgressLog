FROM node:lts-bullseye

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl

COPY . .

RUN npm install -g bun

RUN bun install

RUN chmod +x /app/entrypoint_dev.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint_dev.sh"]


