// src/app/settings/page.tsx

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/auth/settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      {/* Botão para Voltar */}
      <div className="mb-6">
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/dashboard">
            <ChevronLeft className="w-4 h-4" />
            Voltar para o Dashboard
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-zinc-900">Configurações da Conta</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <nav className="flex flex-col gap-1">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm">
            Perfil & Segurança
          </div>
          <div className="text-zinc-400 px-4 py-2 text-sm">Privacidade (Breve)</div>
          <div className="text-zinc-400 px-4 py-2 text-sm">Pagamentos (Breve)</div>
        </nav>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle>Dados do Perfil</CardTitle>
            <CardDescription>
              Edite as suas informações de login e aparência.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm user={session.user} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}