import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Login | Auth Mastery",
  description: "Entre na sua conta para acessar o dashboard.",
};

export default function LoginPage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Lado Esquerdo - Branding */}
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
              "Esta infraestrutura de autenticação segue os padrões de segurança mais rigorosos do mercado de 2026."
            </p>
            <footer className="text-sm">Grinaldo Bispo — Lead Developer</footer>
          </blockquote>
        </div>
      </div>

      {/* Lado Direito - Form */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Acessar conta
            </h1>
            <p className="text-sm text-muted-foreground">
              Insira seu e-mail e senha abaixo
            </p>
          </div>
          
          <LoginForm />

          <p className="px-8 text-center text-sm text-muted-foreground">
            Ainda não tem uma conta?{" "}
            <Link
              href="/register"
              className="underline underline-offset-4 hover:text-primary font-medium"
            >
              Criar Conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}