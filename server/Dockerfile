FROM node:22-alpine

# Create app directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git python3 make g++ \
    || true

# Copy dependency manifests first (for docker layer caching)
COPY package*.json ./

# Install only production dependencies (devs not required to run)
RUN npm ci --production --prefer-offline --no-audit || npm install --production

# Copy application source
COPY . .

# Expose server port
EXPOSE 8080

# Use a non-root user for better security (optional)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup || true
USER appuser

# Start the server
CMD ["npm", "start"]
