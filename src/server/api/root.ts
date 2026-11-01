import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { applicationRouter } from "@/server/api/routers/application";
import { caseRouter } from "@/server/api/routers/case";
import { introRouter } from "@/server/api/routers/intro";
import { painPointRouter } from "@/server/api/routers/pain-point";
import { regionRouter } from "@/server/api/routers/region";
import { solutionRouter } from "@/server/api/routers/solution";
import { newsRouter } from "@/server/api/routers/news";
import { devRouter } from "@/server/api/routers/dev";
import { accountRouter } from "@/server/api/routers/account";
import { tagRouter } from "@/server/api/routers/tag";
import { dashboardRouter } from "@/server/api/routers/dashboard";
import { catalogRouter } from "@/server/api/routers/catalog";

export const appRouter = createTRPCRouter({
  region: regionRouter,
  painPoint: painPointRouter,
  solution: solutionRouter,
  case: caseRouter,
  intro: introRouter,
  application: applicationRouter,
  news: newsRouter,
  dev: devRouter,
  account: accountRouter,
  tag: tagRouter,
  catalog: catalogRouter,
  dashboard: dashboardRouter,
  // 驗證登入狀態與 protectedProcedure
  me: protectedProcedure
    .output(z.object({ name: z.string().nullable(), role: z.string().optional() }))
    .query(({ ctx }) => {
      const user = ctx.session.user;
      return {
        name: user.name ?? null,
        role: (user as { role?: string }).role,
      };
    }),
});

export type AppRouter = typeof appRouter;
