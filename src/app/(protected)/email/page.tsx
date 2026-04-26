// src/app/(protected)/email/page.tsx

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EmailConfigForm } from "@/components/admin/email-config-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EmailConfigPage() {
  const session = await auth();

  // Bloqueio de segurança nível de página
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // BUSCA OS DADOS NO BANCO:
  // Tentamos buscar a configuração única do sistema
  const initialData = await prisma.systemSettings.findUnique({
    where: { id: "system_config" },
  });

  return (
    <div className="container max-w-4xl py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
        <p className="text-muted-foreground text-lg">
          Configurações globais do sistema de mensageria.
        </p>
      </div>

      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="bg-zinc-50/50">
          <CardTitle>Configuração de E-mail (SMTP)</CardTitle>
          <CardDescription>
            Estas credenciais permitem que o sistema envie e-mails automáticos.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* PASSAMOS OS DADOS BUSCADOS PARA O FORMULÁRIO */}
          <EmailConfigForm initialData={initialData} />
        </CardContent>
      </Card>
    </div>
  );
}