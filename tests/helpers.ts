import type { PrismaClient } from "@prisma/client";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { db } from "@/server/db";

export type Ctx = Awaited<ReturnType<typeof createTRPCContext>>;

export const makeCtx = (session: Ctx["session"]): Ctx =>
  ({ db, session, headers: new Headers() }) as Ctx;

export const publicCaller = () => appRouter.createCaller(makeCtx(null));

export const adminCaller = () =>
  appRouter.createCaller(
    makeCtx({ user: { name: "admin" }, expires: new Date().toISOString() }),
  );

/** 清空所有測試表（先子表後父表，順序必須正確） */
export async function cleanAllTables(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction([
    prisma.devComment.deleteMany(),
    prisma.devPart.deleteMany(),
    prisma.devProject.deleteMany(),
    prisma.newsTag.deleteMany(),
    prisma.news.deleteMany(),
    prisma.caseTag.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.tagGroup.deleteMany(),
    prisma.account.deleteMany(),
    prisma.application.deleteMany(),
    prisma.casePainPoint.deleteMany(),
    prisma.caseSolution.deleteMany(),
    prisma.solutionPainPoint.deleteMany(),
    prisma.intro.deleteMany(),
    prisma.case.deleteMany(),
    prisma.solution.deleteMany(),
    prisma.painPoint.deleteMany(),
    prisma.region.deleteMany(),
  ]);
}
