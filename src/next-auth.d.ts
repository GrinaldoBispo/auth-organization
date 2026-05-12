// src/next-auth.d.ts

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    username?: string | null;
    role?: "ADMIN" | "SUPERADMIN" | "STAFF";
    orgId?: string | null;
    active?: boolean;
  }

  interface Session {
    // Adicionamos o campo error para capturar falhas de usuário inativo
    error?: "UserInactive" | "ConnectionError"; 
    user: {
      id: string;
      username?: string | null;
      role?: "ADMIN" | "SUPERADMIN" | "STAFF";
      orgId?: string | null;
      active?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string | null;
    role?: "ADMIN" | "SUPERADMIN" | "STAFF";
    orgId?: string | null;
    active?: boolean;
    // Também adicionamos no JWT para o middleware conseguir ler
    error?: "UserInactive" | "ConnectionError";
  }
}