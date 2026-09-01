FROM node:20-alpine AS base
WORKDIR /app

FROM base AS dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install

FROM dependencies AS development
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "run", "dev"]

FROM dependencies AS builder
COPY . .
RUN npx prisma generate && npm run build

FROM base AS production
ENV NODE_ENV=production
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 4000
CMD ["node", "dist/server.js"]
