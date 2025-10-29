# Use Node.js LTS version
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (skip scripts to avoid build errors)
RUN npm ci --ignore-scripts

# Install tsx for running TypeScript directly
RUN npm install -g tsx

# Copy source code
COPY src/ ./src/
COPY global.d.ts ./
COPY worker-configuration.d.ts ./

# Set environment variable defaults (can be overridden)
ENV NODE_ENV=production

# Run the TypeScript file directly with tsx
CMD ["tsx", "src/stdio-server.ts"]
