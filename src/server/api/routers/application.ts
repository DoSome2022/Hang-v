import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/constants";

const applicationStatusEnum = z.enum(APPLICATION_STATUSES as [ApplicationStatus, ...ApplicationStatus[]]);

const painPointSnapshot = z.object({
  painPointId: z.string(),
  title: z.string(),
});

const applicationOutput = z.object({
  id: z.string(),
  applicantName: z.string(),
  applicantContact: z.string(),
  note: z.string().nullable(),
  status: applicationStatusEnum,
  caseId: z.string(),
  caseTitle: z.string(),
  painPointsSnapshot: z.array(painPointSnapshot),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const applicationSelect = {
  case: { select: { title: true } },
} as const;

type ApplicationRow = Prisma.ApplicationGetPayload<{
  include: typeof applicationSelect;
}>;

const toOutput = (row: ApplicationRow) => {
  const { case: sourceCase, painPointsSnapshot, ...rest } = row;
  return {
    ...rest,
    caseTitle: sourceCase.title,
    painPointsSnapshot:
      (painPointsSnapshot as Array<{ painPointId: string; title: string }>) ??
      [],
  };
};

export const applicationRouter = createTRPCRouter({
  // 公開：提交申請（痛點須屬於該案例，快照寫入 DB）
  create: publicProcedure
    .input(
      z.object({
        caseId: z.string().min(1),
        applicantName: z.string().min(1).max(80),
        applicantContact: z.string().min(1).max(180),
        note: z.string().max(2000).optional(),
        painPointIds: z.array(z.string()).max(50),
      }),
    )
    .output(applicationOutput)
    .mutation(async ({ ctx, input }) => {
      const sourceCase = await ctx.db.case.findUnique({
        where: { id: input.caseId },
        include: {
          painPoints: {
            select: { painPoint: { select: { id: true, title: true } } },
          },
        },
      });
      if (!sourceCase) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "案例不存在" });
      }
      const validIds = new Set(
        sourceCase.painPoints.map((p) => p.painPoint.id),
      );
      const uniqueIds = [...new Set(input.painPointIds)];
      for (const pid of uniqueIds) {
        if (!validIds.has(pid)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "痛點不屬於該案例" });
        }
      }
      const snapshot = uniqueIds.map((pid) => ({
        painPointId: pid,
        title: sourceCase.painPoints.find((p) => p.painPoint.id === pid)!
          .painPoint.title,
      }));
      const row = await ctx.db.application.create({
        data: {
          caseId: input.caseId,
          applicantName: input.applicantName,
          applicantContact: input.applicantContact,
          note: input.note,
          painPointsSnapshot: snapshot,
        },
        include: applicationSelect,
      });
      return toOutput(row);
    }),
  // 後台：申請列表（可依狀態篩選）
  list: protectedProcedure
    .input(z.object({ statuses: z.array(applicationStatusEnum).optional() }).optional())
    .output(z.array(applicationOutput))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.application.findMany({
        where: input?.statuses?.length ? { status: { in: input.statuses } } : undefined,
        orderBy: { createdAt: "desc" },
        include: applicationSelect,
      });
      return rows.map(toOutput);
    }),
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(applicationOutput)
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.application.findUniqueOrThrow({
        where: { id: input.id },
        include: applicationSelect,
      });
      return toOutput(row);
    }),
  // 狀態切換（5 狀態：pending → quoted → developing → completed / cancelled）
  update: protectedProcedure
    .input(z.object({ id: z.string(), status: applicationStatusEnum }))
    .output(applicationOutput)
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.db.application.update({
        where: { id: input.id },
        data: { status: input.status },
        include: applicationSelect,
      });
      return toOutput(row);
    }),
});
