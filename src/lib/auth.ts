import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rateLimit";
import { recordAuditLog } from "@/lib/audit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || "stocktoday-secure-secret-key-at-least-32-chars-long",
  pages: {
    signIn: "/signin",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();

        // Rate limiting login attempts: maximum 5 attempts per 15 minutes per email
        const rateCheck = checkRateLimit(`login:${email}`, 5, 15 * 60 * 1000);
        if (!rateCheck.allowed) {
          console.warn(`[SECURITY] Rate limit exceeded for login attempt: ${email}`);
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash || user.disabledAt) {
          return null;
        }

        const isValid = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!isValid) {
          await recordAuditLog({
            userId: user.id,
            action: "LOGIN_FAILURE",
            meta: { email, reason: "Invalid password attempt" },
          }).catch(() => {});
          return null;
        }

        await recordAuditLog({
          userId: user.id,
          action: "LOGIN_SUCCESS",
          meta: { email, role: user.role },
        }).catch(() => {});

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferredLang: user.preferredLang,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
        token.preferredLang = (user as unknown as { preferredLang: string }).preferredLang;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.preferredLang = token.preferredLang as string;
      }
      return session;
    },
  },
});
