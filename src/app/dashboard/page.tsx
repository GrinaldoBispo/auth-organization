// src/app/dashboard/page.tsx

import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  // Se por algum motivo o Proxy falhar, essa é a nossa segunda linha de defesa
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-zinc-50">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo, {session.user?.email}!
        </h1>
        <p className="text-muted-foreground">
          Você está em uma rota 100% protegida.
        </p>
      </div>
      
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <Button size="lg" variant="destructive" className="cursor-pointer">
          Sair do Sistema
        </Button>
      </form>
    </div>
  );
}