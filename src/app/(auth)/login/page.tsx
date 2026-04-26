// src/app/(auth)/login/page.tsx

import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
        <p className="text-zinc-500">Entre com sua conta ou use o Google</p>
      </div>

      <LoginForm />
      <div className="text-center text-sm text-zinc-500">
        Novo por aqui?{" "}
        <Link href="/register" className="text-blue-600 font-semibold hover:underline">
          Crie sua conta agora
        </Link>
      </div>
    </div>
  );
}