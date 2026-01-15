FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY src/ ./src/

EXPOSE 8084

USER node

CMD ["node", "src/index.js"]
