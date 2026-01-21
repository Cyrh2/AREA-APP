### Multi-stage build for Vite web app -> serve with nginx on port 8081

# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit || npm install --production

# Copy source and build
COPY . .
RUN npm run build

# Production stage: nginx
FROM nginx:stable-alpine

# Remove default static content
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create directory for runtime-shared files (client.apk)
RUN mkdir -p /usr/share/nginx/html/shared

# Install curl so HTTP healthchecks can use it
RUN apk add --no-cache curl

# Add custom nginx config that listens on 8081 and serves /client.apk from shared
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]