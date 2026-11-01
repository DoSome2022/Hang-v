import type { PrismaClient } from "@prisma/client";

// 清空所有測試表（先子表後父表，順序必須正確）。
// 獨立檔案：setup.ts 需要喺唔載入 app graph（next-auth）嘅情況下清理；
// 加新表時呢度同 helpers 一齊更新（helpers 只 re-export）。
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
    prisma.service.deleteMany(),
    prisma.serviceCategory.deleteMany(),
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
