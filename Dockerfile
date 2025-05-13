# Build angular app
FROM node:22-alpine as frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
COPY frontend/.npmrc ./
RUN npm install --legacy-peer-deps

COPY frontend .
RUN npm run generate
RUN npm run build

# Build nestjs app
FROM node:22-alpine as backend-builder
WORKDIR /app/backend
COPY api/package*.json ./
COPY api/.npmrc ./
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

EXPOSE 3000

CMD ["node", "dist/src/main.js"]