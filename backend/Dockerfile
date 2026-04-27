# Stage 1 — install production dependencies (with build tools for better-sqlite3)
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json ./
RUN npm install --omit=dev

# Stage 2 — runtime image
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./

EXPOSE 8000
CMD ["node", "src/server.js"]
