FROM node:22-alpine

# Update npm to its latest compatible release
RUN npm install --global npm@latest

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=3000
EXPOSE 3000

USER node
CMD ["npm", "start"]
