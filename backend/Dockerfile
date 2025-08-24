FROM node:20-alpine AS deps
WORKDIR /app
# copy package.json only; package-lock may be out of sync
COPY package.json ./
# install production deps
RUN npm install --omit=dev

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json tsconfig.json ./
# copy source
COPY . .
# install dev deps and build
RUN npm install && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
EXPOSE 3001
CMD ["node", "dist/server.js"]
