import "server-only";
import { headers } from "next/headers";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

// Server Component 直接呼叫 tRPC 的入口（無 HTTP 往返）
export const createCaller = async () => {
  const h = await headers();
  return appRouter.createCaller(await createTRPCContext({ headers: h }));
};
