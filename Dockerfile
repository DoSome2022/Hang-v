FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

# 安裝依賴
COPY package*.json ./
RUN npm ci

# 複製所有原始碼
COPY . .

# prisma generate 唔需要真實 DB，用 dummy URL 過 schema 檢查
ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy?schema=public

# build 時注入公開站網址（未設 → 全站 noindex）
ARG NEXT_PUBLIC_SITE_URL=""
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1

# 執行 Prisma 生成與 Next.js 建置（build 唔打 DB）
RUN npx prisma generate
RUN npm run build

# standalone server 由 .next/standalone 目錄 serve，要補返 static + public
RUN mkdir -p .next/standalone/.next && \
    cp -r .next/static .next/standalone/.next/static && \
    cp -r public .next/standalone/public

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", ".next/standalone/server.js"]
