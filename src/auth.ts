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
  },
  // PERMISSÃO 2: Autoriza o Adapter a unir as contas no banco de dados
  allowDangerousEmailAccountLinking: true,
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
		async createUser({ user }) {
		  // CENÁRIO 2: Usuário NOVO vindo do Google
		  // Só gera username se ele realmente não tiver um (o que é o caso de novos users Google)
		  if (!user.username && user.email) {
			const userNamePart = user.email.split("@")[0].toLowerCase();
			const randomId = Math.floor(100 + Math.random() * 900);
			const generatedUsername = `${userNamePart}${randomId}`;

			await prisma.user.update({
			  where: { id: user.id },
			  data: { 
				username: generatedUsername,
				emailVerified: new Date(), // Novos usuários Google já nascem verificados
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

			// CENÁRIO 1: Usuário já existia (Vínculo)
			if (existingUser) {
			  await prisma.user.update({
				where: { id: existingUser.id },
				data: {
				  // SÓ atualiza o emailVerified se estiver nulo
				  emailVerified: existingUser.emailVerified || new Date(),
				  // SÓ atualiza a imagem se o usuário não tiver uma
				  image: existingUser.image || profile?.picture || user.image || null,
				  // IMPORTANTE: Não incluímos o 'username' aqui para NÃO sobrescrever o seu!
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
        session.user.role = token.role; // <-- ADICIONE ISSO (ROLE)
      }
      
      return session;
    },

    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        return { ...token, ...session.user };
      }

      // Se for o momento do login, o 'user' existe
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
      token.role = existingUser.role; // <-- ADICIONE ISSO (Garante que o token tenha a role atualizada)
      
      return token;
    }
  }
});