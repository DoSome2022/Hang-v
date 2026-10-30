import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

const accountKindEnum = z.enum(["quotation", "invoice", "receipt"]);

const accountInput = z.object({
  kind: accountKindEnum,
  company: z.string().min(1),
  number: z.string().min(1),
  amount: z.number().int().min(0),
  status: z.string().min(1),
  issuedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式須為 YYYY-MM-DD")
    .optional(),
});

const accountOutput = z.object({
  id: z.string(),
  kind: accountKindEnum,
  company: z.string(),
  number: z.string(),
  amount: z.number(),
  status: z.string(),
  issuedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const accountRouter = createTRPCRouter({
  // 後台帳目列表（可依 kind 篩選）
  list: protectedProcedure
    .input(z.object({ kind: accountKindEnum.optional() }).optional())
    .output(z.array(accountOutput))
    .query(async ({ ctx, input }) => {
      return ctx.db.account.findMany({
        where: input?.kind ? { kind: input.kind } : undefined,
        orderBy: [{ kind: "asc" }, { createdAt: "desc" }],
      });
    }),
  create: protectedProcedure
    .input(accountInput)
    .output(accountOutput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.account.create({
        data: {
          kind: input.kind,
          company: input.company,
          number: input.number,
          amount: input.amount,
          status: input.status,
          issuedAt: input.issuedAt ? new Date(`${input.issuedAt}T00:00:00.000Z`) : null,
        },
      });
    }),
  update: protectedProcedure
    .input(accountInput.extend({ id: z.string() }))
    .output(accountOutput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.account.update({
        where: { id },
        data: {
          kind: data.kind,
          company: data.company,
          number: data.number,
          amount: data.amount,
          status: data.status,
          issuedAt: data.issuedAt ? new Date(`${data.issuedAt}T00:00:00.000Z`) : null,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.account.delete({ where: { id: input.id } });
      return { id: input.id };
    }),
});
