// src/app/(protected)/dashboard/page.tsx

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Buscamos o estado REAL do usuário no banco
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, orgId: true }
  });

  // 1. Se for STAFF, permite acesso direto (ou redireciona para a home da staff)
  if (dbUser?.role === "STAFF") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Painel da Staff</h1>
        <p>Bem-vindo, {session.user.name}. Você está logado como colaborador.</p>
      </div>
    );
  }

  // 2. Se for ADMIN e NÃO tiver empresa, manda para o onboarding
  if (dbUser?.role === "ADMIN" && !dbUser?.orgId) {
    redirect("/onboarding");
  }

  // 3. Se for ADMIN e TIVER empresa, mostra o dashboard completo
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Painel Administrativo</h1>
      <p>Gerencie sua unidade: {dbUser?.orgId}</p>
    </div>
  );
}