// src/proxy.ts

import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  // @ts-ignore - Captura o erro que injetamos no token
  const isInactive = req.auth?.error === "UserInactive";

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = ["/", "/login", "/register", "/error"].includes(nextUrl.pathname);

  if (isApiAuthRoute) return;

  // Se o usuário está logado mas foi desativado, manda para o erro ou login
  if (isInactive) {
    return Response.redirect(new URL("/login?error=InactiveUser", nextUrl));
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  // 2. Redirecionamento de quem já está logado e tenta ir para o login
  if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }

  return;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};