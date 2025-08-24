FROM node:20-alpine AS deps
WORKDIR /app
# copy package.json only (no package-lock.json present)
COPY package.json ./
# install production deps
RUN npm install --omit=dev

FROM node:20-alpine AS builder
WORKDIR /app
# copy lockfiles and config first for better cache
# copy package.json and config files (no package-lock.json present)
COPY package.json vite.config.ts tsconfig.json ./
# copy rest of project (dockerignore prevents node_modules from being copied)
COPY . .
# install dev deps and build
RUN npm install && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
RUN npm i -g serve
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
