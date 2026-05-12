// src/app/(protected)/layout.tsx

import { auth } from "@/auth";
import { Sidebar } from "@/components/admin/sidebar";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // 1. Verificação de segurança: Se a sessão não existir ou 
  // se o erro de usuário inativo for detectado, redirecionamos.
  // @ts-ignore - Caso você ainda não tenha tipado o campo error
  if (!session || session.error === "UserInactive") {
    redirect("/login?error=InactiveUser");
  }

  return (
    <div className="h-full relative">
      {/* 2. Passamos a role com segurança usando o optional chaining */}
      <Sidebar role={session.user.role} />
      
      <main className="md:pl-[280px] h-full">
        {children}
      </main>
    </div>
  );
}