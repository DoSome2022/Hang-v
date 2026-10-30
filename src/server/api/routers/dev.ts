import type { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

const checklistItem = z.object({ label: z.string(), done: z.boolean() });
const meetingItem = z.object({
  date: z.string(),
  text: z.string(),
  parts: z.array(z.string()),
  people: z.array(z.string()),
});

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式須為 YYYY-MM-DD")
  .optional();

const projectInput = z.object({
  name: z.string().min(1),
  client: z.string().min(1),
  status: z.string().default(""),
  delivery: dateOnly,
  warranty: dateOnly,
  link: z.string().optional(),
  meetings: z.array(meetingItem).default([]),
});

const commentOutput = z.object({
  id: z.string(),
  who: z.string(),
  whenLabel: z.string(),
  text: z.string(),
  createdAt: z.date(),
});

const partOutput = z.object({
  id: z.string(),
  name: z.string(),
  owner: z.string(),
  deadline: z.date().nullable(),
  checklist: z.array(checklistItem),
  comments: z.array(commentOutput),
});

const projectOutput = z.object({
  id: z.number(),
  name: z.string(),
  client: z.string(),
  status: z.string(),
  delivery: z.date().nullable(),
  warranty: z.date().nullable(),
  link: z.string().nullable(),
  meetings: z.array(meetingItem),
  parts: z.array(partOutput),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const projectSummaryOutput = z.object({
  id: z.number(),
  name: z.string(),
  client: z.string(),
  status: z.string(),
  delivery: z.date().nullable(),
  warranty: z.date().nullable(),
  link: z.string().nullable(),
  parts: z.array(partOutput),
});

const partInclude = {
  parts: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      comments: { orderBy: { createdAt: "asc" as const } },
    },
  },
} as const;

const parseChecklist = (raw: unknown): { label: string; done: boolean }[] => {
  const parsed = z.array(checklistItem).safeParse(raw);
  return parsed.success ? parsed.data : [];
};

const parseMeetings = (raw: unknown): z.infer<typeof meetingItem>[] => {
  const parsed = z.array(meetingItem).safeParse(raw);
  return parsed.success ? parsed.data : [];
};

const toProjectOutput = (
  row: Prisma.DevProjectGetPayload<{ include: typeof partInclude }>,
): z.infer<typeof projectOutput> => ({
  id: row.id,
  name: row.name,
  client: row.client,
  status: row.status,
  delivery: row.delivery,
  warranty: row.warranty,
  link: row.link,
  meetings: parseMeetings(row.meetings),
  parts: row.parts.map((p) => ({
    id: p.id,
    name: p.name,
    owner: p.owner,
    deadline: p.deadline,
    checklist: parseChecklist(p.checklist),
    comments: p.comments.map((c) => ({
      id: c.id,
      who: c.who,
      whenLabel: c.whenLabel,
      text: c.text,
      createdAt: c.createdAt,
    })),
  })),
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const toProjectSummaryOutput = (
  row: Prisma.DevProjectGetPayload<{ include: typeof partInclude }>,
): z.infer<typeof projectSummaryOutput> => ({
  id: row.id,
  name: row.name,
  client: row.client,
  status: row.status,
  delivery: row.delivery,
  warranty: row.warranty,
  link: row.link,
  parts: row.parts.map((p) => ({
    id: p.id,
    name: p.name,
    owner: p.owner,
    deadline: p.deadline,
    checklist: parseChecklist(p.checklist),
    comments: p.comments.map((c) => ({
      id: c.id,
      who: c.who,
      whenLabel: c.whenLabel,
      text: c.text,
      createdAt: c.createdAt,
    })),
  })),
});

export const devRouter = createTRPCRouter({
  list: protectedProcedure
    .output(z.array(projectSummaryOutput))
    .query(async ({ ctx }) => {
      const rows = await ctx.db.devProject.findMany({
        orderBy: { createdAt: "desc" },
        include: partInclude,
      });
      return rows.map(toProjectSummaryOutput);
    }),
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .output(projectOutput)
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.devProject.findUniqueOrThrow({
        where: { id: input.id },
        include: partInclude,
      });
      return toProjectOutput(row);
    }),
  create: protectedProcedure
    .input(projectInput)
    .output(projectOutput)
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.db.devProject.create({
        data: {
          name: input.name,
          client: input.client,
          status: input.status,
          delivery: input.delivery ? new Date(`${input.delivery}T00:00:00.000Z`) : null,
          warranty: input.warranty ? new Date(`${input.warranty}T00:00:00.000Z`) : null,
          link: input.link,
          meetings: input.meetings,
        },
        include: partInclude,
      });
      return toProjectOutput(row);
    }),
  update: protectedProcedure
    .input(projectInput.extend({ id: z.number() }))
    .output(projectOutput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const row = await ctx.db.devProject.update({
        where: { id },
        data: {
          name: data.name,
          client: data.client,
          status: data.status,
          delivery: data.delivery ? new Date(`${data.delivery}T00:00:00.000Z`) : null,
          warranty: data.warranty ? new Date(`${data.warranty}T00:00:00.000Z`) : null,
          link: data.link,
          meetings: data.meetings,
        },
        include: partInclude,
      });
      return toProjectOutput(row);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .output(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.devProject.delete({ where: { id: input.id } });
      return { id: input.id };
    }),
  addPart: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        name: z.string().min(1),
        owner: z.string().default(""),
        deadline: dateOnly,
        checklist: z.array(checklistItem).default([]),
      }),
    )
    .output(partOutput)
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.db.devPart.create({
        data: {
          projectId: input.projectId,
          name: input.name,
          owner: input.owner,
          deadline: input.deadline ? new Date(`${input.deadline}T00:00:00.000Z`) : null,
          checklist: input.checklist,
        },
        include: { comments: { orderBy: { createdAt: "asc" } } },
      });
      return {
        id: row.id,
        name: row.name,
        owner: row.owner,
        deadline: row.deadline,
        checklist: parseChecklist(row.checklist),
        comments: row.comments.map((c) => ({
          id: c.id,
          who: c.who,
          whenLabel: c.whenLabel,
          text: c.text,
          createdAt: c.createdAt,
        })),
      };
    }),
  updatePart: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        owner: z.string().default(""),
        deadline: dateOnly,
        checklist: z.array(checklistItem).default([]),
      }),
    )
    .output(partOutput)
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.db.devPart.update({
        where: { id: input.id },
        data: {
          name: input.name,
          owner: input.owner,
          deadline: input.deadline ? new Date(`${input.deadline}T00:00:00.000Z`) : null,
          checklist: input.checklist,
        },
        include: { comments: { orderBy: { createdAt: "asc" } } },
      });
      return {
        id: row.id,
        name: row.name,
        owner: row.owner,
        deadline: row.deadline,
        checklist: parseChecklist(row.checklist),
        comments: row.comments.map((c) => ({
          id: c.id,
          who: c.who,
          whenLabel: c.whenLabel,
          text: c.text,
          createdAt: c.createdAt,
        })),
      };
    }),
  deletePart: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.devPart.delete({ where: { id: input.id } });
      return { id: input.id };
    }),
  addComment: protectedProcedure
    .input(
      z.object({
        partId: z.string(),
        who: z.string().min(1),
        whenLabel: z.string().default(""),
        text: z.string().min(1),
      }),
    )
    .output(commentOutput)
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.db.devComment.create({
        data: {
          partId: input.partId,
          who: input.who,
          whenLabel: input.whenLabel,
          text: input.text,
        },
      });
      return {
        id: row.id,
        who: row.who,
        whenLabel: row.whenLabel,
        text: row.text,
        createdAt: row.createdAt,
      };
    }),
  deleteComment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.devComment.delete({ where: { id: input.id } });
      return { id: input.id };
    }),
});
