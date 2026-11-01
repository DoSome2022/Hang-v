import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { db } from "@/server/db";

export { cleanAllTables } from "./tables";

export type Ctx = Awaited<ReturnType<typeof createTRPCContext>>;

export const makeCtx = (session: Ctx["session"]): Ctx =>
  ({ db, session, headers: new Headers() }) as Ctx;

export const publicCaller = () => appRouter.createCaller(makeCtx(null));

export const adminCaller = () =>
  appRouter.createCaller(
    makeCtx({ user: { name: "admin" }, expires: new Date().toISOString() }),
  );
