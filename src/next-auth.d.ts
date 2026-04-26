// src/next-auth.d.ts

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    username?: string | null;
    role?: "ADMIN" | "USER";
  }

  interface Session {
    user: {
      id: string;
      username?: string | null;
      role?: "ADMIN" | "USER";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string | null;
    role?: "ADMIN" | "USER";
  }
}