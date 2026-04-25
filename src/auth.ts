// src/auth.ts

import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { loginSchema } from "@/lib/validations/auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          
          // Debug: Vamos ver se o código chega aqui
          console.log("🔍 Tentando autenticar:", email);

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) {
            console.log("❌ Usuário não encontrado no banco");
            return null;
          }

          const passwordsMatch = await compare(password, user.password);

          if (passwordsMatch) {
            console.log("✅ Senha correta!");
            return user;
          }
          
          console.log("❌ Senha incorreta");
        }
        return null;
      },
    }),
  ],
});