// src/auth.ts

import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { loginSchema } from "@/lib/validations/auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  allowDangerousEmailAccountLinking: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  // Espalhamos o config (que tem o Google)
  ...authConfig,
  // E adicionamos o Credentials completo apenas aqui
  providers: [
    ...authConfig.providers, // Mantém o Google
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
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.name = token.name;
        // @ts-ignore
        session.user.username = token.username;
        session.user.image = token.picture; // Aqui ele pega a URL da foto do token
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // No primeiro login, o 'profile' contém a foto do Google
      if (profile) {
        token.picture = profile.picture;
      }

      if (!token.sub) return token;

      const existingUser = await prisma.user.findUnique({
        where: { id: token.sub },
      });

      if (!existingUser) return token;

      token.name = existingUser.name;
      token.username = existingUser.username;
      // Se o banco tiver a imagem, usamos a do banco
      token.picture = existingUser.image; 
      
      return token;
    }
  }
});