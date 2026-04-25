// src/proxy.ts

import NextAuth from "next-auth";
import authConfig from "./auth.config";

// Aqui usamos o authConfig para que o Middleware seja leve e rode no Edge
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = nextUrl.pathname === "/"; // Adicione outras se tiver
  const isAuthRoute = nextUrl.pathname.startsWith("/login") || 
                      nextUrl.pathname.startsWith("/register");

  if (isApiAuthRoute) return;

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    return;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  return;
});

export const config = {
  // Ajuste o matcher para ignorar arquivos estáticos e focar nas rotas
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};