FROM node:20-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund || \
      (echo "lockfile out of sync — regenerating" && rm -f package-lock.json && npm install --no-audit --no-fund); \
    else \
      npm install --no-audit --no-fund; \
    fi
COPY frontend/ ./
RUN npm run build

FROM node:20-slim AS backend-deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund || \
      (echo "lockfile out of sync — regenerating" && rm -f package-lock.json && npm install --no-audit --no-fund); \
    else \
      npm install --no-audit --no-fund; \
    fi

FROM node:20-slim AS production
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends \
      dumb-init openssl ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY backend/ ./
RUN npx prisma generate

COPY --from=frontend /app/frontend/dist ../frontend/dist

RUN groupadd -r perch && useradd -r -g perch perch && chown -R perch:perch /app
USER perch

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://localhost:4000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx prisma db push && (node prisma/seed.js || true) && node server.js"]