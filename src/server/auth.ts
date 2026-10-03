import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// 僅 admin 一個角色，帳密來自 .env（AUTH_ADMIN_USERNAME / AUTH_ADMIN_PASSWORD）
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        username: { label: "帳號" },
        password: { label: "密碼", type: "password" },
      },
      authorize(credentials) {
        const username =
          typeof credentials?.username === "string" ? credentials.username : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (
          username === process.env.AUTH_ADMIN_USERNAME &&
          password === process.env.AUTH_ADMIN_PASSWORD
        ) {
          return { id: "admin", name: username, role: "admin" };
        }
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
