FROM node:22-alpine


WORKDIR /app


RUN apk add --no-cache git python3 make g++ \
    || true


COPY package*.json ./


RUN npm ci --production --prefer-offline --no-audit || npm install --production


COPY . .


EXPOSE 8080


RUN addgroup -S appgroup && adduser -S appuser -G appgroup || true
USER appuser


CMD ["npm", "start"]
