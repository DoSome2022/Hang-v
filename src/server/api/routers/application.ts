import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

const painPointSnapshot = z.object({
  painPointId: z.string(),
  title: z.string(),
});

const applicationOutput = z.object({
  id: z.string(),
  applicantName: z.string(),
  applicantContact: z.string(),
  note: z.string().nullable(),
  status: z.enum(["pending", "processed"]),
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
        caseId: z.string(),
        applicantName: z.string().min(1),
        applicantContact: z.string().min(1),
        note: z.string().optional(),
        painPointIds: z.array(z.string()),
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
      for (const pid of input.painPointIds) {
        if (!validIds.has(pid)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "痛點不屬於該案例" });
        }
      }
      const snapshot = input.painPointIds.map((pid) => ({
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
  list: protectedProcedure
    .output(z.array(applicationOutput))
    .query(async ({ ctx }) => {
      const rows = await ctx.db.application.findMany({
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
  // 狀態切換：pending ↔ processed
  update: protectedProcedure
    .input(z.object({ id: z.string(), status: z.enum(["pending", "processed"]) }))
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
