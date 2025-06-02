FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl

# Copy dependency files first to take advantage of Docker layer caching
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --verbose

# Copy the rest of the project files
COPY . .

# Run the app
CMD ["bun", "run", "start"]
