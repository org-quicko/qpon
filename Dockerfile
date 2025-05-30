# Build angular app
FROM node:22-alpine as frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend .
RUN npm run generate
RUN npm run build

# Build nestjs app
FROM node:22-alpine as backend-builder
WORKDIR /app/backend
COPY api/package*.json ./
RUN npm install
COPY api .
RUN npm run generate
RUN npm run build

# combined app
FROM node:22-alpine AS runner
WORKDIR /app

# Copy NestJS build output
COPY --from=backend-builder /app/backend ./

# Copy Angular static files into public folder
COPY --from=frontend-builder /app/frontend/dist/frontend/browser ./public

# Make the script executable
RUN chmod +x /app/scripts/db-migrate.sh

EXPOSE 3000

ENTRYPOINT [ "/app/scripts/db-migrate.sh" ]
CMD ["node", "dist/src/main.js"]