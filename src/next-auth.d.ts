// src/next-auth.d.ts

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    username?: string | null;
    role?: "ADMIN" | "SUPERADMIN" | "STAFF"; // Adicionei STAFF conforme seu schema
    orgId?: string | null; // Faltava isso
  }

  interface Session {
    user: {
      id: string;
      username?: string | null;
      role?: "ADMIN" | "SUPERADMIN" | "STAFF";
      orgId?: string | null; // Faltava isso
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string | null;
    role?: "ADMIN" | "SUPERADMIN" | "STAFF";
    orgId?: string | null; // Faltava isso
  }
}