// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; // Importe o componente que o Shadcn criou

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auth Mastery Pro",
  description: "Sistema de Autenticação Profissional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* O conteúdo da página entra aqui */}
        {children}
        
        {/* O Toaster deve ficar aqui para aparecer em todas as rotas */}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}