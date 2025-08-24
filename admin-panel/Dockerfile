FROM node:20-alpine AS builder
ARG APP_DIR=admin-panel
WORKDIR /app

# Copy shared types first
COPY shared ./shared

# Copy admin app into the image and install deps inside admin folder
COPY ${APP_DIR} ./admin
WORKDIR /app/admin
RUN npm install

# Build Next.js app inside /app/admin
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/admin/.next ./.next
COPY --from=builder /app/admin/node_modules ./node_modules
COPY --from=builder /app/admin/package.json ./
EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
