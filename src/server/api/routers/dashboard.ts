import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { APPLICATION_STATUSES } from "@/lib/constants";

const statsOutput = z.object({
  regions: z.number(),
  painPoints: z.number(),
  solutions: z.number(),
  cases: z.number(),
  intros: z.number(),
  news: z.number(),
  devProjects: z.number(),
  accounts: z.number(),
  applicationsTotal: z.number(),
  applicationStatuses: z.record(z.string(), z.number()),
});

export const dashboardRouter = createTRPCRouter({
  // 後台 dashboard 統計（真實數字）
  stats: protectedProcedure
    .output(statsOutput)
    .query(async ({ ctx }) => {
      const [
        regions,
        painPoints,
        solutions,
        cases,
        intros,
        news,
        devProjects,
        accounts,
        applicationsTotal,
        statusGroups,
      ] = await Promise.all([
        ctx.db.region.count(),
        ctx.db.painPoint.count(),
        ctx.db.solution.count(),
        ctx.db.case.count(),
        ctx.db.intro.count(),
        ctx.db.news.count(),
        ctx.db.devProject.count(),
        ctx.db.account.count(),
        ctx.db.application.count(),
        ctx.db.application.groupBy({ by: ["status"], _count: true }),
      ]);
      const applicationStatuses: Record<string, number> = {};
      for (const s of APPLICATION_STATUSES) {
        applicationStatuses[s] = 0;
      }
      for (const g of statusGroups) {
        applicationStatuses[g.status] = g._count;
      }
      return {
        regions,
        painPoints,
        solutions,
        cases,
        intros,
        news,
        devProjects,
        accounts,
        applicationsTotal,
        applicationStatuses,
      };
    }),
});
