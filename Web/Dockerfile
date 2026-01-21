


FROM node:22-alpine AS builder
WORKDIR /app


COPY package*.json ./
RUN npm ci --prefer-offline --no-audit || npm install --production


COPY . .
RUN npm run build


FROM nginx:stable-alpine


RUN rm -rf /usr/share/nginx/html/*


COPY --from=builder /app/dist /usr/share/nginx/html


RUN mkdir -p /usr/share/nginx/html/shared


RUN apk add --no-cache curl


COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]
