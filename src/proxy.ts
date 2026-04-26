// src/proxy.ts

import NextAuth from "next-auth";
import authConfig from "./auth.config";

// Aqui usamos o authConfig para que o Middleware seja leve e rode no Edge
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = nextUrl.pathname === "/"; 
  
  // 1. ADICIONE AQUI: Rotas de autenticação (Login, Register e Forgot Password)
  const isAuthRoute = 
    nextUrl.pathname.startsWith("/login") || 
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname.startsWith("/forgot-password") ||
    nextUrl.pathname.startsWith("/reset-password"); // Já deixei o reset liberado para o futuro

  if (isApiAuthRoute) return;

  if (isAuthRoute) {
    if (isLoggedIn) {
      // Se já está logado, manda pro Dashboard (evita o cara ver o login de novo)
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    return;
  }

  // 2. Bloqueia quem não está logado e tenta acessar rotas privadas
  if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  return;
});

export const config = {
  // Ajuste o matcher para ignorar arquivos estáticos e focar nas rotas
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};