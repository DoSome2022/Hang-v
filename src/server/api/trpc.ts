import { Prisma } from "@prisma/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

// 每個請求建立一次 context：Prisma、NextAuth session、headers
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth();
  return { db, session, headers: opts.headers };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error }) {
    let code = shape.data.code;
    let httpStatus = shape.data.httpStatus;
    // Prisma 已知錯誤 → 對應的 HTTP 狀態
    if (error.cause instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.cause.code === "P2025") {
        code = "NOT_FOUND";
        httpStatus = 404;
      } else if (error.cause.code === "P2002") {
        code = "CONFLICT";
        httpStatus = 409;
      }
    }
    return {
      ...shape,
      data: {
        ...shape.data,
        code,
        httpStatus,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// admin 操作一律走 protectedProcedure
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // 型別窄化：session 已確認存在
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
