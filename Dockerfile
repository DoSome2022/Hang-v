# Next.js 16 standalone 多階段 build
# ── deps：完整安裝（build 需要 devDependencies） ──
FROM node:22-alpine AS deps
WORKDIR /app
# Prisma engine（musl）需要 openssl
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci

# ── build：prisma generate + next build（build 唔打 DB） ──
# 亦俾 compose 嘅 migrate 服務用（負責 prisma migrate deploy）
FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl
ARG NEXT_PUBLIC_SITE_URL=""
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
# Docker 用 standalone 輸出（runner 直接 node server.js）
ENV STANDALONE_BUILD=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prisma generate 唔需要真實 DB，用 dummy URL 過 schema 檢查
ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy?schema=public
RUN npx prisma generate
RUN npm run build

# ── runner：runtime（non-root，只 serve，唔帶 Prisma CLI） ──
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN apk add --no-cache openssl

# Next standalone bundle + 靜態檔 + public（logo 等）
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

# Prisma runtime client（standalone trace 未必包到，補返）
COPY --from=build --chown=node:node /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=build --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma

RUN mkdir -p .next/cache && chown -R node:node .next

USER node
EXPOSE 3000

# DB down → 503（unhealthy）；Redis down → 200 degraded（唔會誤殺容器）
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1

CMD ["node", "server.js"]
