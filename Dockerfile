# =========================================================
# SentinelScrape Dockerfile
# Multi-stage build for Node.js Express + Socket.io & React Frontend
# =========================================================

FROM node:20-alpine AS base
WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json* ./

# Install npm packages
RUN npm ci || npm install

# Copy application source code
COPY . .

# Build Vite React frontend for production
RUN npm run build

# Expose HTTP / WebSocket server port and Vite preview port
EXPOSE 5000
EXPOSE 5173

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV FRONTEND_URL=http://localhost:5173

# Healthcheck endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start full-stack server
CMD ["npm", "run", "start:all"]
