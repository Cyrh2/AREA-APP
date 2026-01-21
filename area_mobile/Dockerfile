
FROM node:22-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm ci --prefer-offline --no-audit

# Ensure curl is available for healthchecks and debug tooling
RUN apk add --no-cache curl || true

COPY . .

# Expose Expo / Metro ports so the bundler and devtools are reachable from other

EXPOSE 19000 19001 19002 8081

CMD ["npm", "start", "--", "--host", "lan"]
