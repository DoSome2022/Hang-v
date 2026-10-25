# Next.js 16 standalone 多階段 build
# ── 第一階段：build（prisma generate + next build）──
# 亦俾 compose 嘅 migrate 服務用（負責 prisma migrate deploy）
FROM node:22-alpine AS build
WORKDIR /app
# Prisma engine（musl）需要 openssl
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY . .
RUN mkdir -p public

# prisma generate 唔需要真實 DB，用 dummy URL 過 schema 檢查
ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy?schema=public
RUN npx prisma generate

RUN npm run build

# ── 第二階段：runtime（app 只 serve，唔帶 Prisma CLI）──
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl

# Next standalone bundle + 靜態檔
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# Prisma runtime client（standalone trace 未必包到，補返）
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
