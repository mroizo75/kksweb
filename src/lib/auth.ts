import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-post", type: "email" },
        password: { label: "Passord", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("E-post og passord er påkrevd");
          }

          const user = await db.user.findUnique({
            where: {
              email: credentials.email as string,
            },
          });

          if (!user || !user.hashedPassword) {
            throw new Error("Ugyldig e-post eller passord");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.hashedPassword
          );

          if (!isPasswordValid) {
            throw new Error("Ugyldig e-post eller passord");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
});
