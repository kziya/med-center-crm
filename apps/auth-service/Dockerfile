# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy full source code
COPY . .

# Build only the auth-service
RUN yarn nx build auth-service

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Copy built app
COPY --from=builder /app/dist/apps/auth-service ./dist

# Copy only needed runtime files
COPY --from=builder /app/package.json .
COPY --from=builder /app/yarn.lock .

# Install production dependencies inside container
RUN yarn install --production --frozen-lockfile

CMD ["node", "dist/main.js"]
