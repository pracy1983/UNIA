# Multi-stage Dockerfile for UNIA (Easypanel Optimized - Mono-container)
# Cache bust: 2

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# Force clean install to avoid shadowed node_modules
RUN rm -rf node_modules && npm install && npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
# Fix permissions: host's node_modules can shadow container's
RUN rm -rf node_modules && npm install
RUN npx tsc

# Stage 3: Production
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy built backend
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package*.json ./
RUN npm install --omit=dev

# Copy built frontend into backend's public folder
COPY --from=frontend-builder /app/frontend/dist ./dist/public

EXPOSE 3000

# Start command
CMD ["node", "dist/index.js"]
