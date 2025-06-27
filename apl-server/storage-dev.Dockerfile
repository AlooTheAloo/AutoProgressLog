FROM node:lts-bullseye

# Install Bun
RUN npm install -g bun

# Set root working directory
WORKDIR /app

# Copy root package + lockfile to install shared deps
COPY ./package.json ./bun.lockb ./
RUN bun install

# Copy only the apl-storage code
COPY ./apl-storage ./apl-storage

# Set working directory to the microservice
WORKDIR /app/apl-storage

EXPOSE 2727

# Hot reload during development
ENTRYPOINT ["bun", "run", "--watch", "src/index.ts"]
