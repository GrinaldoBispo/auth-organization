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
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          // Busca por email ou username (conforme seu schema)
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

          // Retornamos o objeto user para popular o JWT inicial
          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
  events: {
    async createUser({ user }: { user: any }) {
      // Autogeração de username para novos usuários (ex: Google)
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

    async jwt({ token, user, trigger, session }) {
  if (trigger === "update" && session?.user) {
    return { ...token, ...session.user };
  }

  // No login inicial, o objeto 'user' vem do authorize() ou do provider
  if (user) {
    token.role = (user as any).role;
    token.orgId = (user as any).orgId;
    token.username = (user as any).username;
    return token; // Retorna imediatamente no login
  }

  // Só buscamos no banco se o token ainda não tiver as informações essenciais
  if (!token.role || token.orgId === undefined) {
    const dbUser = await prisma.user.findUnique({
      where: { id: token.sub },
      select: { role: true, orgId: true, username: true, image: true, name: true }
    });

    if (dbUser) {
      token.role = dbUser.role;
      token.orgId = dbUser.orgId;
      token.username = dbUser.username;
    }
  }
  
  return token;
},

    async session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        
        // Repassa os dados do Token (JWT) para a Sessão (Acessível no Front)
        // @ts-ignore - Evita erros de tipagem rápida
        session.user.username = token.username;
        session.user.image = token.picture as string;
        // @ts-ignore
        session.user.role = token.role;
        // @ts-ignore
        session.user.orgId = token.orgId;
      }
      
      return session;
    },
  }
});