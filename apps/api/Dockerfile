FROM node:20-alpine AS base
# Prisma's query engine needs OpenSSL on Alpine; without it the API crashes on first DB query
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

FROM base AS dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install --legacy-peer-deps

FROM dependencies AS development
COPY . .
RUN npx prisma generate --schema=prisma/schema
EXPOSE 4000
CMD ["npm", "run", "dev"]

FROM dependencies AS builder
COPY . .
RUN npx prisma generate --schema=prisma/schema && npm run build

FROM base AS production
ENV NODE_ENV=production
# Reuse the builder's node_modules: it already contains the generated Prisma client.
# (The old `npm ci` here failed without a package-lock.json and shipped no Prisma client.)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
RUN mkdir -p /app/uploads
EXPOSE 4000
CMD ["node", "dist/server.js"]
