// src/app/(auth)/forgot-password/page.tsx

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {/* Removemos o link "Voltar" que estava aqui em cima */}
        <h1 className="text-3xl font-bold tracking-tight">Esqueceu-se da senha?</h1>
        <p className="text-zinc-500 text-sm">
          Introduza o seu e-mail e enviaremos instruções para recuperar o acesso.
        </p>
      </div>

      <ForgotPasswordForm />

      {/* Mantemos apenas este link no final */}
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