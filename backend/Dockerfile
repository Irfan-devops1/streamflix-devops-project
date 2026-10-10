# Build application dependencies
FROM node:22-alpine AS builder

WORKDIR /app

COPY backend/package.json ./
RUN npm install --omit=dev

# Production runtime
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node backend/package.json ./package.json
COPY --chown=node:node backend/server.js ./server.js
COPY --chown=node:node backend/catalog.json ./catalog.json

RUN rm -rf /usr/local/lib/node_modules/npm \
           /usr/local/lib/node_modules/corepack \
           /opt/yarn-v1.22.22

USER node

EXPOSE 3000

CMD ["node", "server.js"]
