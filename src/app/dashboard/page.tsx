// src/app/dashboard/page.tsx

import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
      {/* Círculo da Foto */}
      <Avatar className="h-24 w-24 border-2 border-blue-500">
        <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
        <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
          {session?.user?.name?.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          Bem-vindo, {session?.user?.name}!
        </h1>
        <p className="text-zinc-500 text-lg">
          Login ativo como: <span className="font-mono text-blue-500">@{session?.user?.username}</span>
        </p>
        <p className="text-sm text-zinc-400 italic">({session?.user?.email})</p>
      </div>

      <form action={async () => { "use server"; await signOut(); }}>
        <Button variant="destructive" className="px-8">Sair do Sistema</Button>
      </form>
    </div>
  );
}