# syntax=docker/dockerfile:1

# Stages that don't depend on each other (frontend, api build, api runtime
# deps) are built in parallel by BuildKit. Each copies its lockfile before its
# sources, so `npm ci` is only re-run when dependencies actually change.

# ---- frontend: install + build the Angular app ----
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
ENV NG_CLI_ANALYTICS=false

COPY frontend/package.json frontend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --no-audit --no-fund

COPY frontend/angular.json frontend/tsconfig.json frontend/tsconfig.app.json frontend/tailwind.config.ts frontend/.postcssrc.json ./
COPY frontend/public ./public
COPY frontend/src ./src
RUN npx ng build

# ---- api: install all deps + compile ----
FROM node:22-alpine AS backend-builder
WORKDIR /app/backend

COPY api/package.json api/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY api/nest-cli.json api/tsconfig.json api/tsconfig.build.json ./
COPY api/src ./src
COPY api/db ./db
RUN npx nest build

# ---- api: production-only node_modules ----
FROM node:22-alpine AS backend-deps
WORKDIR /app/backend

COPY api/package.json api/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --no-audit --no-fund

# ---- runtime: compiled api + prod deps + Angular static files ----
FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY api/package.json ./
COPY --chmod=755 api/scripts/db-migrate.sh ./scripts/db-migrate.sh
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=frontend-builder /app/frontend/dist/frontend/browser ./public

EXPOSE 3000

ENTRYPOINT [ "/app/scripts/db-migrate.sh" ]
CMD ["node", "dist/src/main.js"]
