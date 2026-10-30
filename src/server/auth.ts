import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginBlocked, recordLoginFailure, resetLoginFailures } from "@/server/redis";

// 登入限流：同 IP 連續失敗 5 次 → 鎖 15 分鐘（Redis 計數；
// Redis 唔可用時 fail-open，唔會鎖死自己）

function clientIp(request: Request | undefined): string {
  const fwd = request?.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return "unknown";
}

// 僅 admin 一個角色，帳密來自 .env（AUTH_ADMIN_USERNAME / AUTH_ADMIN_PASSWORD）
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        username: { label: "帳號" },
        password: { label: "密碼", type: "password" },
      },
      async authorize(credentials, request) {
        const ip = clientIp(request);
        if (await loginBlocked(ip)) return null;

        const username =
          typeof credentials?.username === "string" ? credentials.username : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (
          username === process.env.AUTH_ADMIN_USERNAME &&
          password === process.env.AUTH_ADMIN_PASSWORD
        ) {
          await resetLoginFailures(ip);
          return { id: "admin", name: username, role: "admin" };
        }
        await recordLoginFailure(ip);
        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as
          | string
          | undefined;
      }
      return session;
    },
  },
});
