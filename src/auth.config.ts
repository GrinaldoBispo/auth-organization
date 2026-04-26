// src/auth.config.ts

import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [
    Google({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // PERMISSÃO 1: Permite vincular com conta de e-mail/senha já existente
      allowDangerousEmailAccountLinking: true,
    }),
  ],
} satisfies NextAuthConfig;