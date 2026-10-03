import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { applicationRouter } from "@/server/api/routers/application";
import { caseRouter } from "@/server/api/routers/case";
import { introRouter } from "@/server/api/routers/intro";
import { painPointRouter } from "@/server/api/routers/pain-point";
import { regionRouter } from "@/server/api/routers/region";
import { solutionRouter } from "@/server/api/routers/solution";

export const appRouter = createTRPCRouter({
  region: regionRouter,
  painPoint: painPointRouter,
  solution: solutionRouter,
  case: caseRouter,
  intro: introRouter,
  application: applicationRouter,
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
