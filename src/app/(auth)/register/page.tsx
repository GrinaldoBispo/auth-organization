// src/app/(auth)/register/page.tsx

import { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Criar Conta | Auth Mastery",
  description: "Crie sua conta para começar a usar a plataforma.",
};

export default function RegisterPage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Lado Esquerdo - Branding (Consistente com o Login) */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="mr-2 h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            A
          </div>
          AuthMastery Pro
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "A jornada para um SaaS de sucesso começa com uma base de usuários segura e bem estruturada."
            </p>
            <footer className="text-sm">Grinaldo Bispo — Lead Developer</footer>
          </blockquote>
        </div>
      </div>

      {/* Lado Direito - Form de Cadastro */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Criar uma conta
            </h1>
            <p className="text-sm text-muted-foreground">
              Insira seu e-mail abaixo para criar sua conta
            </p>
          </div>
          
          <RegisterForm />

          <p className="px-8 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary font-medium"
            >
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}