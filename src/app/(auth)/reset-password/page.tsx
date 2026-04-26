// src/app/(auth)/reset-password/page.tsx

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import Link from "next/link";

interface ResetPasswordPageProps {
  // Mudamos a tipagem para Promise, conforme exigido nas versões novas do Next.js
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  // 1. "Desembrulha" a Promise para conseguir ler o token
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Nova senha</h1>
        <p className="text-zinc-500 text-sm">
          Escolha uma senha forte e segura para o seu próximo acesso.
        </p>
      </div>

      {/* 2. Agora o token vai chegar certinho no formulário */}
      <ResetPasswordForm token={token} />

      <div className="text-center text-sm text-zinc-500">
        Lembra-se da senha?{" "}
        <Link 
          href="/login" 
          className="text-blue-600 font-semibold hover:underline transition-all"
        >
          Volte para o login
        </Link>
      </div>
    </div>
  );
}