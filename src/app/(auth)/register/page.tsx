// src/app/(auth)/register/page.tsx

import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Criar uma conta</h1>
        <p className="text-zinc-500">Introduza os seus dados para começar</p>
      </div>

      <RegisterForm />

      <div className="text-center text-sm text-zinc-500">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-blue-600 font-semibold hover:underline">
          Faça login
        </Link>
      </div>
    </div>
  );
}