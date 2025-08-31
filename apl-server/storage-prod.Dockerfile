FROM node:lts-bullseye

# Install Bun globally
RUN npm install -g bun

# Set root working directory
WORKDIR /app

# Install dependencies at root (shared)
COPY ./package.json ./bun.lockb ./
RUN bun install

# Copy only the storage microservice code
COPY ./apl-storage ./apl-storage

# Move into the microservice directory
WORKDIR /app/apl-storage

# Build the Elysia server for production
RUN bun build \
  src/index.ts \
  --compile \
  --minify-whitespace \
  --minify-syntax \
  --target bun \
  --outfile server

# Expose the port
EXPOSE 2727

# Run the compiled binary
ENTRYPOINT ["/app/apl-storage/server"]
