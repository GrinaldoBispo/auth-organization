// src/app/(protected)/admin/page.tsx

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  // Busca dados REAIS do banco
  const userCount = await prisma.user.count();
  const config = await prisma.systemSettings.findUnique({ where: { id: "system_config" } });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
        <p className="text-muted-foreground">Visão geral do sistema Auth Mastery Pro.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuários Registrados</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Contas criadas no banco</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Configuração SMTP</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
             <div className="text-sm font-semibold">
               {config ? (
                 <span className="text-green-600 flex items-center gap-1">
                   <ShieldCheck className="w-4 h-4" /> Ativo: {config.smtpHost}
                 </span>
               ) : (
                 <span className="text-red-600">Pendente de configuração</span>
               )}
             </div>
             <Link href="/email" className="text-xs text-blue-500 hover:underline mt-2 inline-block">
               Editar configurações
             </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}