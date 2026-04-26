// src/auth.ts

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validations/auth";
import { compare } from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  // O espalhamento do authConfig deve vir antes das customizações se você quiser sobrescrever algo
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: email },
                { username: email }
              ]
            }
          });

          if (!user || !user.password) return null;

          const passwordsMatch = await compare(password, user.password);

          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
  events: {
    async createUser({ user }: { user: any }) { // Adicionado : { user: any }
      if (!user.username && user.email) {
        const userNamePart = user.email.split("@")[0].toLowerCase();
        const randomId = Math.floor(100 + Math.random() * 900);
        const generatedUsername = `${userNamePart}${randomId}`;

        await prisma.user.update({
          where: { id: user.id },
          data: { 
            username: generatedUsername,
            emailVerified: new Date(),
          },
        });
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Autoriza o login
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              emailVerified: existingUser.emailVerified || new Date(),
              image: existingUser.image || profile?.picture || user.image || null,
            },
          });
        }
      }
      return true;
    },

    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      
      if (session.user) {
        // @ts-ignore
        session.user.username = token.username;
        session.user.image = token.picture;
        // @ts-ignore
        session.user.role = token.role;
      }
      
      return session;
    },

    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        return { ...token, ...session.user };
      }

      if (user) {
        // @ts-ignore
        token.role = user.role;
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: token.sub },
      });

      if (!existingUser) return token;

      token.name = existingUser.name;
      // @ts-ignore
      token.username = existingUser.username;
      token.picture = existingUser.image;
      // @ts-ignore
      token.role = existingUser.role;
      
      return token;
    }
  }
});