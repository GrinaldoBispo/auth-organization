// src/auth.config.ts

import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export default {
  providers: [
    Credentials({
      // No Proxy/Edge, deixamos apenas os campos, sem a lógica de authorize
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
    }),
  ],
} satisfies NextAuthConfig;