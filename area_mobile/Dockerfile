# Use a Node.js base image
FROM node:22-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm ci --prefer-offline --no-audit

# Ensure curl is available for healthchecks and debug tooling
RUN apk add --no-cache curl || true

COPY . .

# Expose Expo / Metro ports so the bundler and devtools are reachable from other
# containers and from the host if the ports are published.
# - 19000: Metro / tunnel
# - 19001: Metro websocket
# - 19002: Expo devtools
# Keep 8081 as well for compatibility with some RN tooling that uses it.
EXPOSE 19000 19001 19002 8081

# Start the Expo dev server and bind to LAN so other containers (and the
# host, if ports are published) can reach it. `npm start -- --host lan` will
# forward the argument to `expo start` because `npm start` forwards arguments
# after `--` to the underlying script.
CMD ["npm", "start", "--", "--host", "lan"]
