// src/app/dashboard/page.tsx

import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Settings, LogOut } from "lucide-react"; // Ícones para ficar profissional

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6 bg-zinc-50/50">
      {/* Círculo da Foto com Animação suave */}
      <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
        <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
        <AvatarFallback className="bg-blue-600 text-white text-3xl font-bold">
          {session?.user?.name?.substring(0, 2).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
          Bem-vindo, {session?.user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-zinc-500 text-lg">
          Login ativo como: <span className="font-mono text-blue-600 font-medium">@{session?.user?.username}</span>
        </p>
        <p className="text-sm text-zinc-400 italic">({session?.user?.email})</p>
      </div>

      {/* Grupo de Botões Lado a Lado */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md px-6">
        
        {/* Botão Configurações - Direciona para a nova página */}
        <Button asChild variant="outline" className="flex-1 gap-2 h-11">
          <Link href="/settings">
            <Settings className="w-4 h-4" />
            Configurações
          </Link>
        </Button>

        {/* Botão Sair */}
        <form 
          className="flex-1"
          action={async () => { 
            "use server"; 
            await signOut({ redirectTo: "/login" }); 
          }}
        >
          <Button variant="destructive" className="w-full gap-2 h-11">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </form>
      </div>
      
      <p className="text-xs text-zinc-400">Ambiente de Produção v1.0</p>
    </div>
  );
}